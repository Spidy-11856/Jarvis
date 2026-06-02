/* ============================================
   JARVIS - Markdown Parser (No Dependencies)
   ============================================ */

class MarkdownParser {
  static parse(text) {
    if (!text) return '';
    let html = text;

    // Escape HTML
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Code blocks with language
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const langLabel = lang ? `<span style="position:absolute;top:4px;left:10px;font-size:10px;color:#666;">${lang}</span>` : '';
      return `<pre>${langLabel}<button class="copy-code-btn" onclick="JARVIS.copyCode(this)">📋 Copy</button><code>${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold & Italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Strikethrough
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Blockquotes
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Unordered lists
    html = html.replace(/^[\s]*[-*+] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border);margin:12px 0;">');

    // Tables
    html = html.replace(/^\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)*)/gm, (match, header, body) => {
      const headers = header.split('|').map(h => `<th>${h.trim()}</th>`).join('');
      const rows = body.trim().split('\n').map(row => {
        const cells = row.replace(/^\||\|$/g, '').split('|').map(c => `<td>${c.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    });

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    // Clean up
    html = `<p>${html}</p>`;
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[123]>)/g, '$1');
    html = html.replace(/(<\/h[123]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<table>)/g, '$1');
    html = html.replace(/(<\/table>)<\/p>/g, '$1');
    html = html.replace(/<p>(<blockquote>)/g, '$1');
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
    html = html.replace(/<p>(<hr[^>]*>)<\/p>/g, '$1');

    return html;
  }
}
