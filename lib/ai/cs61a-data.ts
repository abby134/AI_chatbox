import { ragService, type SyllabusChunk } from './rag-service';
import { generateUUID } from '../utils';
import { cs61aRealScraper } from './cs61a-scraper-real';

export interface CS61ASection {
  title: string;
  content: string;
  week?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  type: 'assignment' | 'exam' | 'lecture' | 'policy';
  learningObjectives?: string[];
  prerequisites?: string[];
}

export class CS61ADataService {
  private static instance: CS61ADataService;
  
  private constructor() {}
  
  static getInstance(): CS61ADataService {
    if (!CS61ADataService.instance) {
      CS61ADataService.instance = new CS61ADataService();
    }
    return CS61ADataService.instance;
  }

  /**
   * 获取 CS61A syllabus 数据（模拟数据）
   */
  getMockSyllabusData(): CS61ASection[] {
    return [
      {
        title: "课程介绍和 Python 基础",
        content: "CS61A 是加州大学伯克利分校的计算机科学入门课程。本课程将教授 Python 编程语言的基础知识，包括变量、表达式、函数和控制结构。学生将学习如何编写简单的程序来解决实际问题。课程采用项目导向的学习方式，通过实际编程练习来巩固概念。",
        week: 1,
        difficulty: "beginner",
        topics: ["Python 基础", "变量和表达式", "函数定义"],
        type: "lecture",
        learningObjectives: [
          "理解计算机科学的基本概念",
          "掌握 Python 基本语法",
          "学会编写简单的函数"
        ],
        prerequisites: ["无编程经验要求"]
      },
      {
        title: "Lab 0: 环境搭建",
        content: "Lab 0 的截止日期是 6月30日 晚上11:59。这个实验主要关注计算机环境设置和终端导航练习。学生需要安装 Python 解释器、配置开发环境，并完成基本的终端命令练习。实验包括设置 Git 仓库、运行 Python 程序，以及提交作业到课程系统。",
        week: 1,
        difficulty: "beginner",
        topics: ["环境配置", "终端使用", "Git 基础"],
        type: "assignment",
        learningObjectives: [
          "配置 Python 开发环境",
          "掌握基本终端命令",
          "学会使用 Git 版本控制"
        ],
        prerequisites: ["无"]
      },
      {
        title: "函数和控制结构",
        content: "函数是程序的基本构建块，它们允许我们将代码组织成可重用的片段。在本章节中，我们将学习如何定义和调用函数，理解作用域和环境图，以及使用 if 语句和循环等控制结构。环境图是理解程序执行过程的重要工具。",
        week: 2,
        difficulty: "beginner",
        topics: ["函数", "控制结构", "作用域", "环境图"],
        type: "lecture",
        learningObjectives: [
          "定义和调用函数",
          "理解函数作用域",
          "使用 if 语句和循环",
          "绘制环境图"
        ],
        prerequisites: ["Python 基础语法"]
      },
      {
        title: "Homework 1: 函数和控制",
        content: "Homework 1 的截止日期是周四晚上11:59。作业内容包括函数定义、条件语句和循环的练习。学生需要完成多个编程问题，包括数字游戏、字符串处理和简单的算法实现。作业将通过自动测试系统进行评分。",
        week: 2,
        difficulty: "beginner",
        topics: ["函数编程", "条件语句", "循环"],
        type: "assignment",
        learningObjectives: [
          "应用函数编程概念",
          "实现条件逻辑",
          "使用循环解决问题"
        ],
        prerequisites: ["Lab 0 完成"]
      },
      {
        title: "期中考试 1",
        content: "期中考试 1 定于 7月17日 晚上7-9点进行，仅限线下考试。考试地点将在考试前一周公布。考试内容包括 Python 基础、函数、控制结构和环境图。考试形式为笔试，包含编程题和概念题。学生需要携带学生证和计算器。",
        week: 3,
        difficulty: "intermediate",
        topics: ["Python 基础", "函数", "控制结构", "环境图"],
        type: "exam",
        learningObjectives: [
          "评估编程基础知识",
          "测试问题解决能力",
          "验证概念理解"
        ],
        prerequisites: ["完成前两周课程内容"]
      },
      {
        title: "数据抽象",
        content: "数据抽象是计算机科学的基本概念。它允许我们隐藏数据结构的复杂性，专注于我们可以对数据做什么，而不是如何实现它。我们将学习列表、字典，以及如何创建我们自己的抽象数据类型。",
        week: 4,
        difficulty: "intermediate",
        topics: ["列表", "字典", "数据抽象", "抽象数据类型"],
        type: "lecture",
        learningObjectives: [
          "使用列表和字典",
          "理解数据抽象",
          "创建抽象数据类型",
          "实现数据结构"
        ],
        prerequisites: ["函数和控制结构"]
      },
      {
        title: "递归",
        content: "递归是一种强大的编程技术，其中函数调用自身。它特别适用于可以分解为更小、相似子问题的问题。我们将学习如何递归思考，编写递归函数，并理解调用栈。递归是解决树结构和分治算法的关键。",
        week: 5,
        difficulty: "intermediate",
        topics: ["递归", "调用栈", "树递归", "递归思维"],
        type: "lecture",
        learningObjectives: [
          "理解递归思维",
          "编写递归函数",
          "追踪递归调用",
          "使用递归解决问题"
        ],
        prerequisites: ["函数和数据结构"]
      },
      {
        title: "面向对象编程",
        content: "面向对象编程（OOP）是一种编程范式，它将代码组织成包含数据和代码的对象。我们将学习类、对象、继承和多态。这将帮助我们编写更有组织性和可维护性的代码。OOP 是现代软件开发的基础。",
        week: 6,
        difficulty: "intermediate",
        topics: ["类", "对象", "继承", "多态"],
        type: "lecture",
        learningObjectives: [
          "定义类和创建对象",
          "理解继承",
          "使用多态",
          "编写面向对象程序"
        ],
        prerequisites: ["函数和数据结构"]
      },
      {
        title: "课程政策",
        content: "课程政策包括：作业逾期提交在24小时内可获得75%的学分；考试必须按时参加，除非有特殊情况；学术诚信是必须的，抄袭将受到严厉处罚；联系邮箱是 cs61a@berkeley.edu；办公时间在每周二和周四下午2-4点。",
        week: 0,
        difficulty: "beginner",
        topics: ["课程政策", "评分标准", "学术诚信"],
        type: "policy",
        learningObjectives: [
          "了解课程规则",
          "理解评分标准",
          "遵守学术诚信"
        ],
        prerequisites: ["无"]
      }
    ];
  }

  /**
   * 将 syllabus 数据转换为文档块
   */
  convertToChunks(sections: CS61ASection[]): SyllabusChunk[] {
    const chunks: SyllabusChunk[] = [];
    
    for (const section of sections) {
      // 将每个章节分割成更小的块
      const sectionChunks = this.splitIntoChunks(section.content, 200);
      
      for (let i = 0; i < sectionChunks.length; i++) {
        chunks.push({
          id: generateUUID(),
          content: sectionChunks[i],
          metadata: {
            chapter: section.title,
            topic: section.topics.join(', '),
            difficulty: section.difficulty,
            week: section.week,
            type: section.type,
          },
        });
      }
    }
    
    return chunks;
  }

  /**
   * 将文本分割成小块
   */
  private splitIntoChunks(text: string, maxLength: number): string[] {
    const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (currentChunk.length + trimmedSentence.length > maxLength && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = trimmedSentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
      }
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  /**
   * 获取 CS61A syllabus 数据（支持真实抓取和模拟数据）
   */
  async getSyllabusData(useRealScraper: boolean = false): Promise<CS61ASection[]> {
    if (useRealScraper) {
      try {
        console.log('🌐 Using real CS61A scraper...');
        const sections = await cs61aRealScraper.scrapeCS61AWebsite();
        
        // 保存抓取的数据用于调试
        await cs61aRealScraper.saveScrapedData(sections);
        
        return sections;
      } catch (error) {
        console.warn('⚠️ Real scraper failed, falling back to mock data:', error);
        return this.getMockSyllabusData();
      }
    } else {
      console.log('🎭 Using mock CS61A data...');
      return this.getMockSyllabusData();
    }
  }

  /**
   * 初始化 RAG 系统
   */
  async initializeRAG(useRealScraper: boolean = false): Promise<void> {
    try {
      console.log('Initializing CS61A RAG system...');
      
      // 获取 syllabus 数据
      const sections = await this.getSyllabusData(useRealScraper);
      
      // 转换为文档块
      const chunks = this.convertToChunks(sections);
      
      // 添加到 RAG 系统
      await ragService.addSyllabusContent(chunks);
      
      console.log(`CS61A RAG system initialized with ${chunks.length} chunks`);
    } catch (error) {
      console.error('Failed to initialize CS61A RAG system:', error);
      throw error;
    }
  }

  /**
   * 查询 CS61A 相关问题
   */
  async query(question: string): Promise<any> {
    try {
      return await ragService.query(question);
    } catch (error) {
      console.error('Failed to query CS61A RAG system:', error);
      throw error;
    }
  }
}

export const cs61aDataService = CS61ADataService.getInstance(); 