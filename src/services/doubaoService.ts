import type { JobCard } from '../types';

// 豆包 LLM API 配置
const DOUBAO_API_KEY = import.meta.env.VITE_DOUBAO_API_KEY || '';
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

// 使用支持视觉的模型 - 需要开通服务
const DOUBAO_VISION_MODEL = 'doubao-1.5-vision-pro-32k-250115';
// 纯文本模型作为备选
const DOUBAO_TEXT_MODEL = 'doubao-pro-32k-241215';

// 系统提示词 - 定义 AI 的角色和输出格式
const SYSTEM_PROMPT = `你是一位专业的求职助手，擅长从职位描述中提取结构化信息并提供求职建议。

请根据用户提供的职位描述，提取以下信息并以 JSON 格式返回：

{
  "company": {
    "name": "公司名称（从JD中提取，若未提供则为空字符串）",
    "type": "企业类型，可选值：互联网、国企、外企、金融、其他（根据JD判断，若无法判断则为"其他"）"
  },
  "position": {
    "title": "职位名称（从JD中提取，若未提供则为空字符串）",
    "salary": "薪资范围（从JD中提取，若未提供则为空字符串）",
    "location": "工作地点（从JD中提取，若未提供则为空字符串）",
    "education": "学历要求（从JD中提取，若未提供则为空字符串）",
    "experience": "工作经验要求（从JD中提取，若未提供则为空字符串）"
  },
  "aiAnalysis": {
    "responsibilities": ["岗位职责1", "岗位职责2", ...],
    "requirements": ["任职要求1", "任职要求2", ...],
    "suggestions": {
      "resume": "基于该岗位的简历优化建议（100字以内）",
      "interview": "面试准备建议（100字以内）",
      "negotiation": "薪资谈判建议（100字以内）"
    }
  }
}

重要规则：
1. 只基于用户提供的实际信息提取，不要编造任何内容
2. 如果某字段在JD中未提及，返回空字符串或空数组
3. 返回的必须是合法的 JSON 格式，不要包含任何其他文字`;

// 图片消息内容项
interface ImageContentItem {
  type: 'image_url';
  image_url: {
    url: string;
  };
}

// 文本消息内容项
interface TextContentItem {
  type: 'text';
  text: string;
}

type ContentItem = ImageContentItem | TextContentItem;

interface DoubaoMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ContentItem[];
}

// 豆包响应类型
interface DoubaoResponseType {
  choices: {
    message: {
      content: string;
    };
  }[];
  error?: {
    message: string;
    code: string;
  };
}

/**
 * 调用豆包 LLM API 解析职位信息
 * @param text 用户输入的文本
 * @param imageBase64 可选的图片 base64 数据（不含 data:image 前缀）
 * @returns 解析后的职位信息
 */
export async function parseJobWithDoubao(
  text: string,
  imageBase64?: string
): Promise<Partial<JobCard>> {
  if (!DOUBAO_API_KEY) {
    console.warn('豆包 API Key 未配置，使用模拟数据');
    return simulateParseJob(text);
  }

  try {
    // 判断是否有图片
    const hasImage = imageBase64 && imageBase64.length > 0;
    const model = hasImage ? DOUBAO_VISION_MODEL : DOUBAO_TEXT_MODEL;

    const messages: DoubaoMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (hasImage) {
      // 构建多模态消息 - OpenAI 兼容格式
      const content: ContentItem[] = [
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`,
          },
        },
      ];

      // 添加文本提示
      const promptText = text.trim()
        ? `请分析图片中的职位描述，并结合以下信息提取结构化数据：${text}`
        : '请分析图片中的职位描述，提取结构化信息。';

      content.push({
        type: 'text',
        text: promptText,
      });

      messages.push({ role: 'user', content });
    } else {
      // 纯文本消息
      messages.push({
        role: 'user',
        content: `请分析以下职位描述，提取结构化信息：\n\n${text}`,
      });
    }

    console.log('发送请求到豆包 API:', { model, hasImage });

    const response = await fetch(DOUBAO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    const responseData: DoubaoResponseType = await response.json();

    if (!response.ok) {
      console.error('豆包 API 调用失败:', response.status, responseData);
      throw new Error(`API 调用失败: ${response.status} - ${responseData.error?.message || '未知错误'}`);
    }

    // 检查响应中是否有错误
    if (responseData.error) {
      console.error('豆包 API 返回错误:', responseData.error);
      throw new Error(`API 错误: ${responseData.error.message}`);
    }

    const content = responseData.choices?.[0]?.message?.content || '';
    console.log('豆包 API 响应内容:', content.substring(0, 200));

    // 解析 JSON 响应
    const parsedData = extractJsonFromResponse(content);

    if (parsedData) {
      return formatJobData(parsedData);
    } else {
      console.warn('无法从响应中解析 JSON，使用模拟数据');
      return simulateParseJob(text);
    }
  } catch (error) {
    console.error('调用豆包 API 出错:', error);
    // 出错时回退到模拟数据
    return simulateParseJob(text);
  }
}

/**
 * 从 AI 响应中提取 JSON 数据
 */
function extractJsonFromResponse(content: string): any | null {
  if (!content) return null;

  try {
    // 尝试直接解析
    return JSON.parse(content);
  } catch {
    // 尝试从 markdown 代码块中提取
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch {
        // 继续尝试其他方法
      }
    }

    // 尝试查找 JSON 对象（匹配最外层的大括号）
    const objectMatch = content.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        // 解析失败
      }
    }
  }
  return null;
}

/**
 * 格式化解析后的数据为 JobCard 格式
 */
function formatJobData(data: any): Partial<JobCard> {
  return {
    id: `job-${Date.now()}`,
    company: {
      name: data.company?.name || '',
      type: data.company?.type || '其他',
    },
    position: {
      title: data.position?.title || '',
      salary: data.position?.salary || '',
      location: data.position?.location || '',
      status: 'new',
      education: data.position?.education || '',
      experience: data.position?.experience || '',
    },
    aiAnalysis: {
      responsibilities: data.aiAnalysis?.responsibilities || [],
      requirements: data.aiAnalysis?.requirements || [],
      suggestions: {
        resume: data.aiAnalysis?.suggestions?.resume || '请提供更多职位信息以获取建议',
        interview: data.aiAnalysis?.suggestions?.interview || '请提供更多职位信息以获取建议',
        negotiation: data.aiAnalysis?.suggestions?.negotiation || '请提供更多职位信息以获取建议',
      },
    },
    createdAt: Date.now(),
    hasReminder: false,
  };
}

/**
 * 模拟解析（当 API 不可用时使用）
 */
function simulateParseJob(text: string): Partial<JobCard> {
  // 简单的关键词提取逻辑
  const companyMatch = text.match(/(?:公司|企业)[：:]?\s*([^\n，。]+)/);
  const titleMatch = text.match(/(前端|后端|全栈|算法|Java|Python|Go|产品|运营|设计|测试).{0,5}(工程师|开发|专家|经理|总监|专员|助理)/);
  const salaryMatch = text.match(/(\d+[kK]-\d+[kK]|\d+万-\d+万|\d+-\d+万)/);
  const locationMatch = text.match(/(北京|上海|广州|深圳|杭州|成都|武汉|西安|南京|苏州|天津|重庆|长沙|郑州|东莞|青岛|沈阳|宁波|昆明|大连|厦门|合肥|佛山|福州|哈尔滨|济南|温州|长春|石家庄|常州|泉州|南宁|贵阳|南昌|金华|珠海|惠州|嘉兴|南通|中山|保定|兰州|台州|徐州|太原|绍兴|烟台|海口|乌鲁木齐|呼和浩特|银川|西宁|拉萨|柳州|桂林|三亚|襄阳|宜昌|岳阳|常德|衡阳|株洲|湘潭|邵阳|益阳|郴州|永州|怀化|娄底|湘西)[市]?/);
  const educationMatch = text.match(/(本科|硕士|博士|大专|专科|高中|中专|不限)/);
  const experienceMatch = text.match(/(\d+年|[一二三四五六七八九十]+年).{0,3}(经验|以上|优先)/);

  return {
    id: `job-${Date.now()}`,
    company: {
      name: companyMatch?.[1]?.trim() || '',
      type: '互联网',
    },
    position: {
      title: titleMatch?.[0] || '',
      salary: salaryMatch?.[0] || '',
      location: locationMatch?.[0] || '',
      status: 'new',
      education: educationMatch?.[0] || '',
      experience: experienceMatch?.[0] || '',
    },
    aiAnalysis: {
      responsibilities: extractListItems(text, ['职责', '工作', '负责']),
      requirements: extractListItems(text, ['要求', '任职', '条件', '资格']),
      suggestions: {
        resume: text.length > 50
          ? '根据该职位要求，建议在简历中突出相关技术栈和项目经验，量化工作成果。'
          : '请提供更多职位信息以获取建议',
        interview: text.length > 50
          ? '建议重点准备技术基础知识和项目经验介绍，了解公司业务背景。'
          : '请提供更多职位信息以获取建议',
        negotiation: text.length > 50
          ? '了解市场薪资水平，结合自身经验和能力合理设定期望。'
          : '请提供更多职位信息以获取建议',
      },
    },
    createdAt: Date.now(),
    hasReminder: false,
  };
}

/**
 * 从文本中提取列表项
 */
function extractListItems(text: string, keywords: string[]): string[] {
  const items: string[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // 检查是否包含关键词
    if (keywords.some(kw => trimmed.includes(kw))) {
      // 尝试提取列表项（以数字、-、•、* 开头的行）
      const match = trimmed.match(/^[\d\-\•\*\.\、]+\s*(.+)$/);
      if (match && match[1].length > 5) {
        items.push(match[1].trim());
      }
    }
  }

  // 如果没有提取到，返回空数组
  return items.slice(0, 5);
}

/**
 * 将图片文件转换为 base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // 移除 data:image/xxx;base64, 前缀
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
