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

    const { useRealScraper = false } = await request.json();

    console.log(`🔄 Reinitializing RAG system with ${useRealScraper ? 'real' : 'mock'} data...`);

    // 重新初始化 RAG 系统
    await cs61aDataService.initializeRAG(useRealScraper);

    // 获取状态
    const status = ragService.getStatus();

    return NextResponse.json({
      success: true,
      data: {
        message: `RAG system reinitialized with ${useRealScraper ? 'real' : 'mock'} data`,
        status,
        useRealScraper,
      },
    });

  } catch (error) {
    console.error('RAG scrape API error:', error);
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

    const status = ragService.getStatus();

    return NextResponse.json({
      success: true,
      data: {
        status,
        message: 'RAG system status retrieved',
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

