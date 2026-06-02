function inlineMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.*?)`/g, "<code>$1</code>");
}

export function MarkdownView({ content }: { content: string }) {
  const html = content
    .split("\n")
    .map((line) => {
      if (line.startsWith("# ")) return `<h1>${inlineMarkdown(line.slice(2))}</h1>`;
      if (line.startsWith("## ")) return `<h2>${inlineMarkdown(line.slice(3))}</h2>`;
      if (line.startsWith("### ")) return `<h3>${inlineMarkdown(line.slice(4))}</h3>`;
      if (line.startsWith("- ")) return `<li>${inlineMarkdown(line.slice(2))}</li>`;
      if (/^\d+\.\s/.test(line)) return `<li>${inlineMarkdown(line.replace(/^\d+\.\s/, ""))}</li>`;
      if (line.startsWith("> ")) return `<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`;
      if (!line.trim()) return "";
      return `<p>${inlineMarkdown(line)}</p>`;
    })
    .join("")
    .replace(/(<li>.*?<\/li>)+/g, (match) => `<ul>${match}</ul>`);

  return <div className="markdown" dangerouslySetInnerHTML={{ __html: html }} />;
}
