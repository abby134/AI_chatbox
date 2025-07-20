import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import { cs61aDataService } from '../cs61a-data';
import type { ChatMessage } from '@/lib/types';

interface QueryCS61AProps {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

export const queryCS61A = ({ session, dataStream }: QueryCS61AProps) =>
  tool({
    description:
      'Query CS61A course information from the syllabus. Use this tool when users ask questions about CS61A course content, assignments, exams, policies, or any other course-related information.',
    inputSchema: z.object({
      question: z.string().describe('The question about CS61A course'),
    }),
    execute: async ({ question }) => {
      try {
        // 查询 RAG 系统
        const result = await cs61aDataService.query(question);

        // 构建回答
        let answer = result.answer;

        // 如果有来源信息，添加到回答中
        if (result.sources && result.sources.length > 0) {
          answer += '\n\n来源信息：';
          result.sources.forEach((source: any, index: number) => {
            answer += `\n${index + 1}. ${source.metadata.chapter} (相似度: ${(source.similarity * 100).toFixed(1)}%)`;
          });
        }

        return {
          answer,
          confidence: result.confidence,
          sources: result.sources?.length || 0,
        };
      } catch (error) {
        console.error('CS61A query error:', error);
        return {
          answer: '抱歉，我在查询 CS61A 课程信息时遇到了问题。请稍后再试。',
          confidence: 0,
          sources: 0,
        };
      }
    },
  }); 

  