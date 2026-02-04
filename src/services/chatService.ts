import type { AIMessage } from '../types';

// 豆包 LLM API 配置
const DOUBAO_API_KEY = import.meta.env.VITE_DOUBAO_API_KEY || '';
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat completions';
const DOUBAO_MODEL = 'doubao-pro-32k-241215';

// 对话消息格式
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
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

// 系统提示词 - 用于多轮对话
const CHAT_SYSTEM_PROMPT = `你是一位专业的求职 AI 助手，名叫"求职小助手"。你的职责是：

1. **职位解析**：帮助用户分析职位描述，提取关键信息
2. **求职建议**：提供简历优化、面试准备、薪资谈判等建议
3. **职业规划**：回答关于职业发展、技能提升的问题
4. **行业洞察**：分享互联网、金融等行业的求职趋势

**交流风格**：
- 友好亲切，像朋友一样交流
- 专业但不失温度
- 回答简洁实用，避免冗长
- 如果不确定，诚实告知

**重要**：
- 保持对话的上下文连贯性
- 记住用户之前提到的职位信息
- 针对用户的追问给出有针对性的回答`;

/**
 * 进行多轮对话
 * @param messages 历史消息列表
 * @param currentInput 当前用户输入
 * @returns AI 的回复
 */
export async function chatWithAI(
  messages: AIMessage[],
  currentInput: string
): Promise<string> {
  if (!DOUBAO_API_KEY) {
    console.warn('豆包 API Key 未配置');
    return simulateChatResponse(currentInput);
  }

  try {
    // 构建对话历史
    const chatMessages: ChatMessage[] = [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
    ];

    // 添加历史消息（最多保留最近 10 轮对话）
    const recentMessages = messages.slice(-10);
    for (const msg of recentMessages) {
      if (msg.type === 'user') {
        chatMessages.push({
          role: 'user',
          content: msg.content || '[用户上传了图片]',
        });
      } else if (msg.type === 'ai' && !msg.parsedJob) {
        // 只添加纯文本回复，不包含职位解析卡片的消息
        chatMessages.push({
          role: 'assistant',
          content: msg.content,
        });
      }
    }

    // 添加当前输入
    chatMessages.push({
      role: 'user',
      content: currentInput,
    });

    const response = await fetch(DOUBAO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_API_KEY}`,
      },
      body: JSON.stringify({
        model: DOUBAO_MODEL,
        messages: chatMessages,
        temperature: 0.7, // 对话模式使用更高的温度，更自然
        max_tokens: 1500,
      }),
    });

    const responseData: ChatResponse = await response.json();

    if (!response.ok) {
      console.error('豆包 API 调用失败:', response.status, responseData);
      throw new Error(`API 调用失败: ${response.status}`);
    }

    if (responseData.error) {
      throw new Error(`API 错误: ${responseData.error.message}`);
    }

    return responseData.choices?.[0]?.message?.content || '抱歉，我没有理解您的问题，请再试一次。';
  } catch (error) {
    console.error('对话 API 出错:', error);
    return simulateChatResponse(currentInput);
  }
}

/**
 * 模拟对话响应（当 API 不可用时使用）
 */
function simulateChatResponse(input: string): string {
  const lowerInput = input.toLowerCase();
  
  // 常见问题预设回复
  if (lowerInput.includes('简历') || lowerInput.includes('cv')) {
    return '关于简历优化，我建议：\n\n1. **突出成果**：用数据说话，比如"提升转化率 30%"\n2. **关键词匹配**：根据 JD 调整关键词，提高通过率\n3. **STAR 法则**：项目经历用情境-任务-行动-结果来描述\n4. **控制长度**：1-2 页为宜，重点前置\n\n需要我针对某个具体岗位帮你优化简历吗？';
  }
  
  if (lowerInput.includes('面试') || lowerInput.includes('面经')) {
    return '面试准备建议：\n\n1. **技术准备**：复习基础知识点，准备项目深挖\n2. **公司研究**：了解公司业务、产品、技术栈\n3. **行为面试**：准备 3-5 个 STAR 案例\n4. **提问环节**：准备 2-3 个有深度的问题\n\n有什么具体岗位的面试想让我帮你准备吗？';
  }
  
  if (lowerInput.includes('薪资') || lowerInput.includes('工资') || lowerInput.includes('offer')) {
    return '薪资谈判技巧：\n\n1. **市场调研**：了解该岗位的市场薪资范围\n2. **总包计算**：关注 base、奖金、股票、福利的综合价值\n3. **谈判时机**：拿到 offer 后再谈，不要过早暴露底线\n4. **留有余地**：首次报价可以比期望高 10-20%\n\n需要我帮你分析某个 offer 吗？';
  }
  
  if (lowerInput.includes('你好') || lowerInput.includes('hi') || lowerInput.includes('hello')) {
    return '你好！我是你的求职小助手 😊\n\n我可以帮你：\n• 分析职位描述\n• 优化求职简历\n• 准备面试\n• 薪资谈判建议\n• 职业规划咨询\n\n有什么我可以帮你的吗？';
  }
  
  if (lowerInput.includes('谢谢') || lowerInput.includes('感谢')) {
    return '不客气！很高兴能帮到你 😊\n\n如果还有其他求职相关的问题，随时问我哦！祝你求职顺利！';
  }
  
  // 默认回复
  return '我理解你的问题。作为求职助手，我可以帮你分析职位、优化简历、准备面试等。\n\n能否提供更多细节？比如：\n• 你感兴趣的岗位类型\n• 目前的求职阶段\n• 遇到的具体问题\n\n这样我能给你更有针对性的建议！';
}
