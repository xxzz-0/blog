/**
 * XSS 过滤工具函数
 * 用于净化 HTML 内容，防止 XSS 攻击
 */

// 允许的 HTML 标签（白名单）
const ALLOWED_TAGS = [
  'p', 'br', 'hr', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 'strike', 'del', 's',
  'a', 'img', 'blockquote', 'code', 'pre',
  'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'sup', 'sub'
];

// 允许的属性（白名单）
const ALLOWED_ATTRS = {
  '*': ['class', 'id'],
  'a': ['href', 'title', 'target'],
  'img': ['src', 'alt', 'title', 'width', 'height'],
  'table': ['border', 'cellpadding', 'cellspacing'],
  'td': ['colspan', 'rowspan'],
  'th': ['colspan', 'rowspan']
};

// 危险的 URL 协议
const DANGEROUS_PROTOCOLS = /^(javascript|data|vbscript|file):/i;

/**
 * 转义 HTML 特殊字符
 * @param {string} text - 需要转义的文本
 * @returns {string} - 转义后的文本
 */
export function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 检查 URL 是否安全
 * @param {string} url - 需要检查的 URL
 * @returns {boolean} - 是否安全
 */
function isSafeUrl(url) {
  if (!url) return true;
  return !DANGEROUS_PROTOCOLS.test(url.trim());
}

/**
 * 净化 HTML 内容
 * @param {string} html - 需要净化的 HTML
 * @returns {string} - 净化后的 HTML
 */
export function sanitizeHtml(html) {
  if (!html) return '';

  // 创建 DOM 解析器
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 递归清理节点
  function cleanNode(node) {
    // 文本节点直接返回
    if (node.nodeType === Node.TEXT_NODE) {
      return node.cloneNode(true);
    }

    // 非元素节点跳过
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return document.createTextNode('');
    }

    const tagName = node.tagName.toLowerCase();

    // 不在白名单中的标签，只保留其子内容
    if (!ALLOWED_TAGS.includes(tagName)) {
      const fragment = document.createDocumentFragment();
      node.childNodes.forEach(child => {
        const cleaned = cleanNode(child);
        if (cleaned) fragment.appendChild(cleaned);
      });
      return fragment;
    }

    // 创建新元素
    const newNode = document.createElement(tagName);

    // 处理属性
    const allowedAttrs = ALLOWED_ATTRS[tagName] || [];
    const globalAttrs = ALLOWED_ATTRS['*'] || [];

    Array.from(node.attributes).forEach(attr => {
      const attrName = attr.name.toLowerCase();

      // 检查属性是否允许
      if (!allowedAttrs.includes(attrName) && !globalAttrs.includes(attrName)) {
        return;
      }

      let attrValue = attr.value;

      // 对 href 和 src 属性进行 URL 安全检查
      if ((attrName === 'href' || attrName === 'src') && !isSafeUrl(attrValue)) {
        return;
      }

      // 对 target="_blank" 的链接添加 rel="noopener noreferrer"
      if (tagName === 'a' && attrName === 'target' && attrValue === '_blank') {
        newNode.setAttribute('rel', 'noopener noreferrer');
      }

      newNode.setAttribute(attrName, attrValue);
    });

    // 递归处理子节点
    node.childNodes.forEach(child => {
      const cleaned = cleanNode(child);
      if (cleaned) newNode.appendChild(cleaned);
    });

    return newNode;
  }

  // 清理 body 内容
  const fragment = document.createDocumentFragment();
  Array.from(doc.body.childNodes).forEach(node => {
    const cleaned = cleanNode(node);
    if (cleaned) fragment.appendChild(cleaned);
  });

  // 创建临时容器获取 HTML
  const temp = document.createElement('div');
  temp.appendChild(fragment);
  return temp.innerHTML;
}

/**
 * 简单的 HTML 转义（用于纯文本显示）
 * @param {string} text - 需要转义的文本
 * @returns {string} - 转义后的 HTML
 */
export function simpleEscape(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
