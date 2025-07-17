import { JSDOM } from 'jsdom';
import { CS61ASection } from './cs61a-data';

export class CS61ARealScraper {
  private static instance: CS61ARealScraper;
  
  private constructor() {}
  
  static getInstance(): CS61ARealScraper {
    if (!CS61ARealScraper.instance) {
      CS61ARealScraper.instance = new CS61ARealScraper();
    }
    return CS61ARealScraper.instance;
  }

  /**
   * 抓取 CS61A 网站内容
   */
  async scrapeCS61AWebsite(): Promise<CS61ASection[]> {
    try {
      console.log('🌐 Scraping CS61A website...');
      
      // CS61A 网站的主要页面
      const urls = [
        'https://cs61a.org',
        'https://cs61a.org/about/',
        'https://cs61a.org/schedule/',
        'https://cs61a.org/policies/',
      ];

      const sections: CS61ASection[] = [];

      for (const url of urls) {
        try {
          console.log(`📄 Scraping: ${url}`);
          const pageSections = await this.scrapePage(url);
          sections.push(...pageSections);
        } catch (error) {
          console.warn(`⚠️ Failed to scrape ${url}:`, error);
        }
      }

      console.log(`✅ Scraped ${sections.length} sections from CS61A website`);
      return sections;
    } catch (error) {
      console.error('❌ Failed to scrape CS61A website:', error);
      throw error;
    }
  }

  /**
   * 抓取单个页面
   */
  private async scrapePage(url: string): Promise<CS61ASection[]> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const sections: CS61ASection[] = [];

      // 提取页面标题
      const title = document.querySelector('title')?.textContent || 'Unknown Page';
      
      // 提取主要内容
      const mainContent = document.querySelector('main') || document.querySelector('.content') || document.body;
      
      if (mainContent) {
        // 提取文本内容
        const content = this.extractTextContent(mainContent);
        
        if (content.trim().length > 0) {
          sections.push({
            title: this.cleanTitle(title),
            content: content,
            week: this.extractWeekFromUrl(url),
            difficulty: this.determineDifficulty(content),
            topics: this.extractTopics(content),
            type: this.determineType(url, content),
            learningObjectives: this.extractLearningObjectives(content),
            prerequisites: this.extractPrerequisites(content),
          });
        }
      }

      return sections;
    } catch (error) {
      console.error(`Failed to scrape page ${url}:`, error);
      return [];
    }
  }

  /**
   * 提取文本内容
   */
  private extractTextContent(element: Element): string {
    // 移除脚本和样式标签
    const scripts = element.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());

    // 获取文本内容
    let text = element.textContent || '';
    
    // 清理文本
    text = text
      .replace(/\s+/g, ' ') // 合并多个空格
      .replace(/\n+/g, '\n') // 合并多个换行
      .trim();

    return text;
  }

  /**
   * 清理标题
   */
  private cleanTitle(title: string): string {
    return title
      .replace(/CS61A\s*[-|]\s*/i, '')
      .replace(/\s*[-|]\s*.*$/, '')
      .trim();
  }

  /**
   * 从 URL 提取周数
   */
  private extractWeekFromUrl(url: string): number | undefined {
    const weekMatch = url.match(/week[-\s]?(\d+)/i);
    return weekMatch ? parseInt(weekMatch[1]) : undefined;
  }

  /**
   * 确定难度级别
   */
  private determineDifficulty(content: string): 'beginner' | 'intermediate' | 'advanced' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('advanced') || lowerContent.includes('complex')) {
      return 'advanced';
    } else if (lowerContent.includes('intermediate') || lowerContent.includes('medium')) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }

  /**
   * 提取主题
   */
  private extractTopics(content: string): string[] {
    const topics: string[] = [];
    const lowerContent = content.toLowerCase();
    
    // 常见 CS61A 主题
    const commonTopics = [
      'python', 'functions', 'control', 'recursion', 'data structures',
      'object-oriented programming', 'algorithms', 'testing', 'debugging',
      'environment diagrams', 'abstraction', 'inheritance', 'polymorphism'
    ];

    commonTopics.forEach(topic => {
      if (lowerContent.includes(topic)) {
        topics.push(topic);
      }
    });

    return topics;
  }

  /**
   * 确定内容类型
   */
  private determineType(url: string, content: string): 'assignment' | 'exam' | 'lecture' | 'policy' {
    const lowerUrl = url.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    if (lowerUrl.includes('lab') || lowerUrl.includes('homework') || lowerContent.includes('assignment')) {
      return 'assignment';
    } else if (lowerUrl.includes('exam') || lowerContent.includes('exam') || lowerContent.includes('test')) {
      return 'exam';
    } else if (lowerUrl.includes('policy') || lowerContent.includes('policy') || lowerContent.includes('rule')) {
      return 'policy';
    } else {
      return 'lecture';
    }
  }

  /**
   * 提取学习目标
   */
  private extractLearningObjectives(content: string): string[] {
    const objectives: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('learning objective') || 
          line.toLowerCase().includes('goal') ||
          line.toLowerCase().includes('understand') ||
          line.toLowerCase().includes('learn')) {
        objectives.push(line.trim());
      }
    }

    return objectives.slice(0, 5); // 限制数量
  }

  /**
   * 提取前置要求
   */
  private extractPrerequisites(content: string): string[] {
    const prerequisites: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('prerequisite') || 
          line.toLowerCase().includes('required') ||
          line.toLowerCase().includes('before')) {
        prerequisites.push(line.trim());
      }
    }

    return prerequisites.slice(0, 3); // 限制数量
  }

  /**
   * 保存抓取的数据到文件（用于调试）
   */
  async saveScrapedData(sections: CS61ASection[], filename: string = 'cs61a-scraped-data.json') {
    const fs = await import('fs/promises');
    await fs.writeFile(filename, JSON.stringify(sections, null, 2));
    console.log(`💾 Saved scraped data to ${filename}`);
  }
}

export const cs61aRealScraper = CS61ARealScraper.getInstance(); 