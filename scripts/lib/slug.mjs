/**
 * 中文转拼音（极简实现）
 * 完整方案依赖 pinyin 包，此处用字符到拼音的映射。
 * 每个中文字符映射为拼音，降级为简单映射表。
 * 实际使用中若发现不准，可替换为 npm:pinyin 包。
 */
function chineseToFullPinyin(text) {
  const MAP = {
    '我': 'wo', '的': 'de', '第': 'di', '一': 'yi', '篇': 'pian',
    '博': 'bo', '客': 'ke', '文': 'wen', '章': 'zhang', '发': 'fa',
    '布': 'bu', '测': 'ce', '试': 'shi', '新': 'xin', '项': 'xiang',
    '目': 'mu', '使': 'shi', '用': 'yong', '中': 'zhong', '国': 'guo',
    '人': 'ren', '大': 'da', '小': 'xiao', '上': 'shang', '下': 'xia',
    '开': 'kai', '关': 'guan', '更': 'geng', '修': 'xiu', '改': 'gai',
    '添': 'tian', '加': 'jia', '删': 'shan', '除': 'chu', '查': 'cha',
    '看': 'kan', '入': 'ru', '门': 'men', '指': 'zhi', '南': 'nan',
    '教': 'jiao', '程': 'cheng', '实': 'shi', '践': 'jian', '总': 'zong',
    '结': 'jie', '分': 'fen', '享': 'xiang',
  };
  const result = text.split('').map(ch => MAP[ch] || '').join(' ');
  const missing = text.split('').filter(ch => !MAP[ch] && /[一-鿿]/.test(ch));
  if (missing.length > 0) {
    console.warn(`以下中文无拼音映射，已跳过: ${missing.join('')}`);
  }
  return result;
}

function normalizeHyphens(str) {
  return str.replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

/**
 * 将中文/英文标题转换为 URL slug
 */
export function generateSlug(text) {
  if (!text || !text.trim()) return '';

  const trimmed = text.trim();

  // 检测是否包含中文字符
  const hasChinese = /[一-鿿]/.test(trimmed);

  if (hasChinese) {
    const pinyin = chineseToFullPinyin(trimmed);
    return normalizeHyphens(pinyin);
  }

  // 英文：小写 + 连字符
  return normalizeHyphens(trimmed.toLowerCase().replace(/[^a-z0-9\s-]/g, ''));
}

/**
 * 清洗 AI 返回内容：剥离首尾的 ```markdown、```、前置闲聊等
 */
export function cleanApiResponse(text) {
  if (!text) return '';
  let cleaned = text.trim();

  // 剥离前置闲聊行
  cleaned = cleaned.replace(/^(Here is|Here\'s|以下是|好的|这是|为你).*\n*/i, '');

  // 剥离首尾 ```markdown 或 ```
  cleaned = cleaned.replace(/^```(markdown|md)?\n*/i, '');
  cleaned = cleaned.replace(/\n*```\s*$/i, '');

  cleaned = cleaned.trim();
  return cleaned;
}
