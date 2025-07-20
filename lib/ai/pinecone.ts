import { Pinecone } from '@pinecone-database/pinecone';

// 调试环境变量
console.log('Pinecone config:', {
  apiKey: process.env.PINECONE_API_KEY ? 'SET' : 'NOT SET',
  index: process.env.PINECONE_INDEX || 'NOT SET',
  environment: process.env.PINECONE_ENVIRONMENT || 'NOT SET'
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX!); 
