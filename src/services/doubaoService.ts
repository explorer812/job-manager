import type { JobCard } from '../types';

// 豆包 LLM API 配置
const DOUBAO_API_KEY = import.meta.env.VITE_DOUBAO_API_KEY || '';
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

// 使用支持视觉的模型 - 需要开通服务
const DOUBAO_VISION_MODEL = 'doubao-1.5-vision-pro-32k-250115';
// 纯文本模型 - 使用 doubao-1.5-pro-32k (需要开通)
const DOUBAO_TEXT_MODEL = 'doubao-1.5-pro-32k-250115';

// 系统提示词 - 定义 AI 的角色和输出格式
const SYSTEM_PROMPT_PART1 = `你是一位专业的求职助手，擅长从职位描述中提取结构化信息并提供求职建议。

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

【关键处理规则】

1. **岗位信息处理（岗位职责和任职要求）- 严格规则**:
   - **第一步 - 识别分点**: 仔细识别原文中的所有分点，包括以数字（1、2、3...）、中文数字（一、二、三...）、符号（-、•、*、·）或序号（1.、（1）、①等）开头的项目
   - **第二步 - 统计数量**: 必须准确统计原文中"岗位职责"和"任职要求"各自的分点总数
   - **第三步 - 逐条处理**: 
     * 对每一个分点单独处理，判断是否需要精炼
     * 如果分点冗长（超过50字）、表述啰嗦、存在语病 → 进行精炼总结
     * 如果分点简短（50字以内）、表述清晰 → 保留原表达
   - **第四步 - 严格输出要求**:
     * **数量严格一致**: 输出数组的长度必须与原文分点数量完全相同，绝对禁止删除、合并或跳过任何分点
     * **顺序严格一致**: 输出数组的顺序必须与原文分点顺序完全一致
     * **逐条对应**: 输出数组的第N个元素必须对应原文的第N个分点
     * 例如：原文有4条职责，输出数组必须有4个元素，且第1个对第1条，第2个对第2条，以此类推
   - **精炼总结标准**:
     * 保留原分点的所有核心信息点
     * 使用专业、简练的语言，去除口语化和冗余
     * 保持专业术语准确性
   - **验证步骤**: 输出前必须核对：数组长度 == 原文分点数量，如不等则重新处理

2. **纯文本信息提取**:
   - 使用关键词定位法提取结构化信息：
     - 公司名称: 查找"公司"、"企业"、"集团"等关键词附近的主体名称
     - 职位名称: 查找"岗位"、"职位"、"招聘"后的具体职称，或技术栈+职位组合（如"Java工程师"）
     - 薪资: 查找数字+货币单位（k/万/元）+范围符号（-/~）的模式
     - 地点: 查找城市名（北京、上海、深圳等）或"工作地点"后的内容
     - 学历: 查找"本科"、"硕士"、"博士"、"大专"等关键词
     - 经验: 查找数字+"年"+"经验/工作年限"的模式
   - 对于岗位职责和任职要求，先定位"职责"、"要求"、"任职"、"岗位内容"等标题，再提取其下的列表项

3. **求职建议生成 - 严格规则**:
   - **核心原则**: 每条建议必须基于JD中的具体要求，给出可执行的策略
   - **格式要求**:
     * 使用分点陈述，每个建议独立成点
     * 每条建议格式：直接引用JD原文或核心要求 → 给出具体执行策略
     * 去掉"JD要求"等前缀，直接表述
     * 每个分点之间用换行符(\n)分隔
   - **简历优化建议**:
     * 分析JD中的核心技能、工具、经验要求
     * 针对每条要求，建议如何在简历中体现（具体写法、位置、量化方式）
     * 示例格式："'精通excel各类公式及功能' → 在技能栏明确列出'Excel(数据透视表/VLOOKUP/宏)'，并在项目经历中补充使用Excel处理数据的具体案例"
   - **面试准备建议**:
     * 基于JD中的工作内容和技术要求，列出可能的面试问题
     * 针对每个问题，建议准备的具体案例或回答思路
     * 示例格式："'策略设计、策略配置' → 准备1个完整的策略运营案例，阐述从需求分析→策略设计→落地执行→效果复盘的全流程"
   - **薪资谈判建议**:
     * 基于JD中的薪资范围、岗位级别、公司类型给出定位
     * 分析可谈判的维度（base薪资、绩效、期权、补贴、晋升周期等）
     * 给出具体的谈判时机和话术建议
     * 示例格式："实习岗位未明确薪资 → 提前了解该公司实习薪资区间(可通过脉脉/牛客网查询)，若低于市场水平可强调自身数据分析技能稀缺性争取更高待遇"
   - **输出格式**: 
     * 每条建议用"•"开头
     * 引用JD原文 → 具体策略（用箭头连接）
     * 每个分点占一行，分点之间用\n\n换行
     * 不要加"JD要求"、"JD涉及"等前缀

4. **通用规则**:
   - 只基于用户提供的实际信息提取，不要编造任何内容
   - 如果某字段在JD中未提及，返回空字符串或空数组
   - 返回的必须是合法的 JSON 格式，不要包含任何其他文字
   - 确保所有中文编码正确，不出现乱码

【学习示例】
以下是一个正确的提取示例，请学习其提取逻辑：`;

const SYSTEM_PROMPT_EXAMPLE_INPUT = `
输入文本：
【工作内容】
1、协助推进策略的落地执行，包括策略设计、策略配置、策略审核、策略费用测算及策略复盘等；
2、对业务数据进行分析处理，可制作excel的可视化看板，产出有效的结论；
3、对于省内其他部门提供相应的支持，包括数据需求支持、协同支持等；
4、协助进行内部项目管理，支持团队日常日常工作；

【任职要求】
1、国家统招全日制研究生及以上，有经济学、计算机、统计学等专业背景优先；
2、实习6个月以上，一周到岗五天，仅接受西安线下办公。
3、可以熟练应用各种办公软件，尤其是excel，各类公式及功能均需相对精通。PPT，Word需熟练应用，sql需可进行数据提取类代码编写；
4、具备较强的沟通能力、业务推进和资源整合能力，能快速学习、灵活分析；
5、有数据分析实习实验、互联网运营实习经验优先。`;

const SYSTEM_PROMPT_EXAMPLE_OUTPUT = `
正确输出：
{
  "company": {
    "name": "",
    "type": "其他"
  },
  "position": {
    "title": "",
    "salary": "",
    "location": "西安",
    "education": "研究生及以上",
    "experience": "实习6个月以上"
  },
  "aiAnalysis": {
    "responsibilities": [
      "协助推进策略的落地执行，包括策略设计、策略配置、策略审核、策略费用测算及策略复盘",
      "对业务数据进行分析处理，制作excel可视化看板，产出有效结论",
      "对省内其他部门提供支持，包括数据需求支持、协同支持",
      "协助进行内部项目管理，支持团队日常工作"
    ],
    "requirements": [
      "国家统招全日制研究生及以上，经济学、计算机、统计学等专业背景优先",
      "实习6个月以上，一周到岗五天，仅接受西安线下办公",
      "熟练应用办公软件，精通excel各类公式及功能，熟练应用PPT、Word，可进行sql数据提取代码编写",
      "具备较强的沟通能力、业务推进和资源整合能力，能快速学习、灵活分析",
      "有数据分析实习经验、互联网运营实习经验优先"
    ],
    "suggestions": {
      "resume": "• '精通excel各类公式及功能，熟练应用PPT、Word，可进行sql数据提取' → 在技能栏明确列出'Excel(数据透视表/VLOOKUP/宏)、SQL数据提取、PPT可视化'，并在项目经历中补充使用Excel制作数据看板的具体案例，量化处理的数据量级\\n\\n• '具备较强的沟通能力、业务推进和资源整合能力' → 在项目描述中加入跨部门协作的具体场景，如'协调产品、技术部门完成XX项目，推动策略落地，节省成本XX%'",
      "interview": "• '策略设计、策略配置、策略审核' → 准备1-2个策略运营案例，阐述从需求分析→策略设计→落地执行→效果复盘的全流程，重点说明如何衡量策略效果\\n\\n• '熟练应用各种办公软件，尤其是excel' → 准备Excel技能演示，包括数据透视表制作、VLOOKUP应用、简单宏编写等，可携带过往制作的Excel作品",
      "negotiation": "• 实习岗位未明确薪资范围 → 提前了解该公司实习薪资区间(可通过脉脉/牛客网查询)，若低于市场水平可强调自身数据分析技能稀缺性争取更高待遇\\n\\n• '实习6个月以上，一周到岗五天' → 在薪资谈判时可询问是否有转正机会及转正后的薪资涨幅，同时了解团队的培养机制和晋升路径，作为是否接受offer的重要参考"
    }
  }
}`;

const SYSTEM_PROMPT_PART2 = `
提取要点：
- 识别【工作内容】和【任职要求】作为分点标题
- 以数字序号（1、2、3...）识别每个分点
- 职责提取4条，要求提取5条，数量严格对应
- 地点从"西安线下办公"提取，学历从"研究生及以上"提取，经验从"实习6个月以上"提取

建议输出格式要点：
- resume/interview/negotiation 每个字段包含2-3条具体建议
- 每条建议格式："• '引用原文' → 具体执行策略"
- 直接引用JD原文，去掉"JD要求"等前缀
- 每个分点占一行，分点之间用\\n\\n换行
- 具体建议必须详细、可操作，避免泛泛而谈`;

// 组合完整的系统提示词
const SYSTEM_PROMPT = SYSTEM_PROMPT_PART1 + SYSTEM_PROMPT_EXAMPLE_INPUT + SYSTEM_PROMPT_EXAMPLE_OUTPUT + SYSTEM_PROMPT_PART2;

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

    console.log('发送请求到豆包 API:', { model, hasImage, apiKey: DOUBAO_API_KEY ? '已配置' : '未配置' });
    console.log('请求消息:', JSON.stringify(messages, null, 2).substring(0, 500));

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
    console.log('API 原始响应:', JSON.stringify(responseData, null, 2).substring(0, 1000));

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
    console.log('豆包 API 完整响应内容:', content);
    console.log('响应内容长度:', content.length);

    // 解析 JSON 响应
    const parsedData = extractJsonFromResponse(content);
    console.log('解析后的数据:', parsedData);

    if (parsedData) {
      console.log('成功解析 JSON，返回格式化数据');
      return formatJobData(parsedData);
    } else {
      console.warn('无法从响应中解析 JSON，使用模拟数据');
      console.log('尝试解析的原始内容:', content);
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
  if (!content) {
    console.log('响应内容为空');
    return null;
  }

  console.log('尝试解析响应内容，长度:', content.length);

  try {
    // 尝试直接解析
    console.log('尝试直接解析 JSON...');
    return JSON.parse(content);
  } catch (e) {
    console.log('直接解析失败:', (e as Error).message);

    // 尝试从 markdown 代码块中提取
    console.log('尝试从 markdown 代码块中提取...');
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      console.log('找到 markdown 代码块，内容长度:', jsonMatch[1].length);
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        console.log('markdown 代码块解析失败:', (e as Error).message);
      }
    }

    // 尝试查找 JSON 对象（匹配最外层的大括号）
    console.log('尝试查找 JSON 对象...');
    // 使用非贪婪匹配找到第一个 { 和最后一个 } 之间的内容
    const objectMatch = content.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      console.log('找到 JSON 对象，长度:', objectMatch[0].length);
      try {
        return JSON.parse(objectMatch[0]);
      } catch (e) {
        console.log('JSON 对象解析失败:', (e as Error).message);
        // 尝试修复常见的 JSON 格式问题
        try {
          // 尝试去除可能的注释
          const cleaned = objectMatch[0].replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
          return JSON.parse(cleaned);
        } catch (e2) {
          console.log('清理后解析也失败:', (e2 as Error).message);
        }
      }
    }
  }
  console.log('所有解析方法都失败');
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
