import { pipeline, env } from '@xenova/transformers';
import { pineconeIndex } from './pinecone';
import { generateUUID } from '../utils';

// 配置 transformers.js 环境
env.allowLocalModels = false;
env.useBrowserCache = false;

export interface SyllabusChunk {
  id: string;
  content: string;
  metadata: {
    chapter?: string;
    topic?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    week?: number;
    type?: 'assignment' | 'exam' | 'lecture' | 'policy';
  };
  similarity?: number;
}

export interface RAGResult {
  answer: string;
  sources: SyllabusChunk[];
  confidence: number;
}

export class RAGService {
  private static instance: RAGService;
  private embedder: any;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  /**
   * 初始化嵌入模型
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('Loading embedding model...');
      this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('Embedding model loaded successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to load embedding model:', error);
      throw error;
    }
  }

  /**
   * 生成文本嵌入（本地模型，384维）
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const result = await this.embedder(text, { pooling: 'mean', normalize: true });
      return Array.from(result.data);
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw error;
    }
  }

  /**
   * 计算余弦相似度
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (normA * normB);
  }

  /**
   * 添加 syllabus 内容到 Pinecone
   */
  async addSyllabusContent(chunks: SyllabusChunk[]) {
    await this.initialize();
    console.log(`Adding ${chunks.length} syllabus chunks...`);
    const vectors = [];
    for (const chunk of chunks) {
      const embedding = await this.generateEmbedding(chunk.content);
      vectors.push({
        id: chunk.id,
        values: embedding,
        metadata: { ...chunk.metadata, content: chunk.content },
      });
    }
    await pineconeIndex.upsert(vectors);
    console.log(`Successfully added ${chunks.length} chunks to Pinecone`);
  }

  /**
   * 检索相关文档块（Pinecone）
   */
  async retrieveChunks(query: string, topK: number = 3): Promise<SyllabusChunk[]> {
    await this.initialize();
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      const result = await pineconeIndex.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
      });
      return result.matches.map((match: any) => ({
        id: match.id,
        content: match.metadata.content,
        metadata: match.metadata,
        similarity: match.score,
      }));
    } catch (error) {
      console.error('Failed to retrieve chunks from Pinecone:', error);
      return [];
    }
  }

  /**
   * 使用 xAI 生成回答
   */
  async generateAnswer(query: string, chunks: SyllabusChunk[]): Promise<string> {
    if (chunks.length === 0) {
      return "抱歉，我在 CS61A 课程大纲中没有找到相关信息。";
    }

    // 构建上下文
    const context = chunks.map(chunk => 
      `章节: ${chunk.metadata.chapter || '未知'}\n内容: ${chunk.content}`
    ).join('\n\n');

    // 构建提示词
    const prompt = `你是一个 CS61A 课程的助教。请根据以下课程信息回答学生的问题。

课程信息：
${context}

学生问题：${query}

请提供准确、有帮助的回答。如果信息不完整，请说明。`;

    try {
      // 这里应该调用 xAI API，但为了演示，我们返回一个模拟回答
      // 实际实现时需要替换为真实的 xAI API 调用
      const answer = await this.callXAI(prompt);
      return answer;
    } catch (error) {
      console.error('Failed to generate answer:', error);
      return "抱歉，生成回答时出现错误。";
    }
  }

  /**
   * 调用 xAI API
   */
  private async callXAI(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-2-1212',
          messages: [
            {
              role: 'system',
              content: '你是一个 CS61A 课程的助教，专门回答关于课程内容、作业、考试和政策的问题。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`xAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '抱歉，无法生成回答。';
    } catch (error) {
      console.error('xAI API call failed:', error);
      // 返回一个基于上下文的简单回答
      return '基于提供的课程信息，我可以回答你的问题。如果需要更详细的回答，请稍后再试。';
    }
  }

  /**
   * 完整的 RAG 查询流程
   */
  async query(question: string, topK: number = 3): Promise<RAGResult> {
    try {
      // 1. 检索相关文档块
      const chunks = await this.retrieveChunks(question, topK);
      
      // 2. 生成回答
      const answer = await this.generateAnswer(question, chunks);
      
      // 3. 计算置信度（基于最高相似度）
      const confidence = chunks.length > 0 ? chunks[0].similarity || 0 : 0;

      return {
        answer,
        sources: chunks,
        confidence,
      };
    } catch (error) {
      console.error('RAG query failed:', error);
      return {
        answer: "抱歉，处理您的问题时出现错误。",
        sources: [],
        confidence: 0,
      };
    }
  }

  /**
   * 获取系统状态
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      // chunkCount: this.syllabusChunks.length, // 移除本地内存计数
      hasEmbeddings: true, // 改为 Pinecone 查询
    };
  }
}

export const ragService = RAGService.getInstance(); 
