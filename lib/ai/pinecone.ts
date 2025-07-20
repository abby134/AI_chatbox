import { Pinecone } from '@pinecone-database/pinecone';

// 调试环境变量
console.log('Pinecone config:', {
  apiKey: process.env.PINECONE_API_KEY ? 'SET' : 'NOT SET',
  index: process.env.PINECONE_INDEX || 'NOT SET',
  environment: process.env.PINECONE_ENVIRONMENT || 'NOT SET'
});

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX;

if (!apiKey) {
  throw new Error('PINECONE_API_KEY is not set in environment variables');
}
if (!indexName) {
  throw new Error('PINECONE_INDEX is not set in environment variables');
}

const pinecone = new Pinecone({ apiKey });

export const pineconeIndex = pinecone.index(indexName); 
