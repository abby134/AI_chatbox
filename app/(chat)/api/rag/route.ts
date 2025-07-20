import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { cs61aDataService } from '@/lib/ai/cs61a-data';
import { ragService } from '@/lib/ai/rag-service';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { question } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      );
    }

    // 检查 RAG 系统是否已初始化
    const status = ragService.getStatus();
    
    if (!status.isInitialized || status.chunkCount === 0) {
      // 如果未初始化，先初始化
      console.log('RAG system not initialized, initializing now...');
      await cs61aDataService.initializeRAG();
    }

    // 查询 RAG 系统
    const result = await cs61aDataService.query(question);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('RAG API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 返回 RAG 系统状态
    const status = ragService.getStatus();

    return NextResponse.json({
      success: true,
      data: {
        status,
        message: status.isInitialized 
          ? 'RAG system is ready' 
          : 'RAG system needs initialization',
      },
    });

  } catch (error) {
    console.error('RAG status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
