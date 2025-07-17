'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface RAGStatus {
  isInitialized: boolean;
  chunkCount: number;
  hasEmbeddings: boolean;
}

export default function RAGAdminPage() {
  const [status, setStatus] = useState<RAGStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/rag');
      const data = await response.json();
      if (data.success) {
        setStatus(data.data.status);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const initializeRAG = async (useRealScraper: boolean) => {
    setLoading(true);
    try {
      const response = await fetch('/api/rag/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ useRealScraper }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data.status);
        toast.success(data.data.message);
      } else {
        toast.error('Failed to initialize RAG system');
      }
    } catch (error) {
      console.error('Failed to initialize RAG:', error);
      toast.error('Failed to initialize RAG system');
    } finally {
      setLoading(false);
    }
  };

  const testQuery = async () => {
    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: 'CS61A 的期中考试什么时候？' }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('RAG system is working!');
        console.log('Test result:', data.data);
      } else {
        toast.error('RAG system test failed');
      }
    } catch (error) {
      console.error('Test query failed:', error);
      toast.error('RAG system test failed');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">CS61A RAG 系统管理</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* 状态卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
            <CardDescription>RAG 系统的当前状态</CardDescription>
          </CardHeader>
          <CardContent>
            {status ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>已初始化:</span>
                  <span className={status.isInitialized ? 'text-green-600' : 'text-red-600'}>
                    {status.isInitialized ? '是' : '否'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>文档块数量:</span>
                  <span>{status.chunkCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>向量嵌入:</span>
                  <span className={status.hasEmbeddings ? 'text-green-600' : 'text-red-600'}>
                    {status.hasEmbeddings ? '已生成' : '未生成'}
                  </span>
                </div>
              </div>
            ) : (
              <p>加载中...</p>
            )}
          </CardContent>
        </Card>

        {/* 操作卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>系统操作</CardTitle>
            <CardDescription>管理 RAG 系统</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button 
                onClick={() => initializeRAG(false)}
                disabled={loading}
                className="w-full"
              >
                {loading ? '初始化中...' : '使用模拟数据初始化'}
              </Button>
              <p className="text-sm text-gray-600">
                使用预设的模拟 CS61A 数据
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={() => initializeRAG(true)}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? '抓取中...' : '使用真实数据初始化'}
              </Button>
              <p className="text-sm text-gray-600">
                从 CS61A 网站抓取真实数据
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={testQuery}
                disabled={!status?.isInitialized}
                variant="secondary"
                className="w-full"
              >
                测试查询
              </Button>
              <p className="text-sm text-gray-600">
                测试 RAG 系统是否正常工作
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 使用说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. 初始化系统</h3>
              <p className="text-sm text-gray-600">
                首次使用需要初始化 RAG 系统。可以选择使用模拟数据（快速）或真实数据（需要网络连接）。
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">2. 测试系统</h3>
              <p className="text-sm text-gray-600">
                初始化完成后，可以测试系统是否正常工作。
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">3. 在聊天中使用</h3>
              <p className="text-sm text-gray-600">
                系统初始化后，在聊天界面中询问 CS61A 相关问题，AI 会自动使用 RAG 系统提供答案。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 