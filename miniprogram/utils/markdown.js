/**
 * Markdown 转 HTML（供 <rich-text> 使用）
 * 所有样式用 inline style，因为 <rich-text> 不支持外部 class
 */
function mdToHtml(md) {
  if (!md) return '';

  const lines = md.split('\n');
  const out = [];
  let inCode = false, codeBuf = '';
  let inUl = false, inOl = false, inBq = false;

  const flushList = () => {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  };
  const flushBq = () => {
    if (inBq) { out.push('</blockquote>'); inBq = false; }
  };

  // 行内格式（粗体、斜体、删除线、代码、链接）
  const inline = (s) => {
    s = s.replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;padding:2rpx 8rpx;border-radius:6rpx;font-size:24rpx;color:#e11d48;">$1</code>');
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:600;color:#111827;">$1</strong>');
    s = s.replace(/\*(.+?)\*/g, '<em style="font-style:italic;">$1</em>');
    s = s.replace(/~~(.+?)~~/g, '<del style="text-decoration:line-through;color:#9ca3af;">$1</del>');
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a style="color:#22c55e;text-decoration:underline;" href="$2">$1</a>');
    return s;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // 代码块
    if (line.startsWith('```')) {
      flushList(); flushBq();
      if (!inCode) { inCode = true; codeBuf = ''; continue; }
      out.push(`<pre style="background:#1e293b;color:#e2e8f0;padding:20rpx 24rpx;border-radius:12rpx;font-size:22rpx;line-height:1.6;overflow-x:auto;margin:12rpx 0;">` +
        `<code>${escapeHtml(codeBuf.trim())}</code></pre>`);
      inCode = false; continue;
    }
    if (inCode) { codeBuf += raw + '\n'; continue; }

    if (line === '') { flushList(); flushBq(); continue; }

    // 标题
    const h = line.match(/^(#{1,4}) (.+)$/);
    if (h) {
      flushList(); flushBq();
      const n = h[1].length;
      const sz = ['32rpx','28rpx','26rpx','24rpx'][n-1];
      const wt = n <= 2 ? '600' : '500';
      out.push(`<h${n} style="font-size:${sz};font-weight:${wt};color:#111827;margin:20rpx 0 12rpx 0;line-height:1.4;">${inline(h[2])}</h${n}>`);
      continue;
    }

    // 引用
    if (line.startsWith('> ')) {
      flushList();
      const txt = inline(line.slice(2));
      if (!inBq) {
        out.push(`<blockquote style="border-left:6rpx solid #22c55e;background:#f0fdf4;padding:12rpx 20rpx;margin:12rpx 0;color:#374151;font-size:26rpx;line-height:1.6;border-radius:0 8rpx 8rpx 0;">${txt}`);
        inBq = true;
      } else {
        out.push(`<br/>${txt}`);
      }
      continue;
    } else flushBq();

    // 无序列表
    const ul = line.match(/^[-*] (.+)$/);
    if (ul) {
      flushBq();
      if (!inUl) { out.push('<ul style="padding-left:24rpx;margin:8rpx 0;">'); inUl = true; }
      out.push(`<li style="font-size:26rpx;line-height:1.7;color:#374151;margin-bottom:6rpx;">· ${inline(ul[1])}</li>`);
      continue;
    }

    // 有序列表
    const ol = line.match(/^\d+\. (.+)$/);
    if (ol) {
      flushBq();
      if (!inOl) { out.push('<ol style="padding-left:24rpx;margin:8rpx 0;">'); inOl = true; }
      out.push(`<li style="font-size:26rpx;line-height:1.7;color:#374151;margin-bottom:6rpx;">${inline(ol[1])}</li>`);
      continue;
    }

    flushList();

    // 普通段落
    out.push(`<p style="font-size:26rpx;line-height:1.7;color:#374151;margin:8rpx 0;">${inline(line)}</p>`);
  }

  flushList(); flushBq();
  if (inCode) {
    out.push(`<pre style="background:#1e293b;color:#e2e8f0;padding:20rpx 24rpx;border-radius:12rpx;font-size:22rpx;line-height:1.6;overflow-x:auto;margin:12rpx 0;"><code>${escapeHtml(codeBuf.trim())}</code></pre>`);
  }

  return out.join('');
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

module.exports = { mdToHtml };
