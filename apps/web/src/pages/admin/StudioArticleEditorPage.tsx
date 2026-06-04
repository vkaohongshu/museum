import { Maximize2, Save } from "lucide-react";
import { FormEvent, UIEvent, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MarkdownView } from "../../components/MarkdownView";
import { useLife } from "../../context/LifeContext";

export function StudioArticleEditorPage() {
  const { id } = useParams();
  const { articles, setArticles, categories, tags } = useLife();
  const existing = articles.find((article) => article.id === id);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "# 新文章\n\n从这里开始写。");
  const [cover, setCover] = useState(existing?.cover ?? "");
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? categories[0]?.id ?? "");
  const [tagIds, setTagIds] = useState<string[]>(existing?.tagIds ?? []);
  const [focus, setFocus] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const syncingRef = useRef(false);
  const articleId = existing?.id ?? `article-${Date.now()}`;
  const previewTitle = title || "未命名文章";

  const preview = useMemo(() => ({ title: previewTitle, body }), [previewTitle, body]);

  function syncScroll(source: HTMLElement, target: HTMLElement | null) {
    if (!target || syncingRef.current) return;
    const sourceMax = source.scrollHeight - source.clientHeight;
    const targetMax = target.scrollHeight - target.clientHeight;
    if (sourceMax <= 0 || targetMax <= 0) return;
    syncingRef.current = true;
    target.scrollTop = (source.scrollTop / sourceMax) * targetMax;
    window.requestAnimationFrame(() => {
      syncingRef.current = false;
    });
  }

  function syncEditorScroll(event: UIEvent<HTMLTextAreaElement>) {
    syncScroll(event.currentTarget, previewRef.current);
  }

  function syncPreviewScroll(event: UIEvent<HTMLDivElement>) {
    syncScroll(event.currentTarget, editorRef.current);
  }

  function save(event: FormEvent) {
    event.preventDefault();
    const now = new Date().toISOString();
    const next = {
      id: articleId,
      title: previewTitle,
      body,
      cover: cover.trim(),
      categoryId,
      tagIds,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      readMinutes: Math.max(1, Math.ceil(body.length / 450)),
      relatedItems: existing?.relatedItems ?? []
    };
    setArticles((current) => existing ? current.map((item) => item.id === existing.id ? next : item) : [next, ...current]);
  }

  return (
    <form className={focus ? "writer-page writer-focus" : "writer-page"} onSubmit={save}>
      <header className="writer-toolbar">
        <Link className="secondary-button" to="/admin/articles">返回文章工作台</Link>
        <button className="ghost-button" type="button" onClick={() => setFocus((value) => !value)}><Maximize2 size={17} />全屏写作</button>
        <button className="primary-button" type="submit"><Save size={17} />保存</button>
      </header>
      <section className="writer-grid">
        <div className="writer-meta panel">
          <input className="writer-title-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="文章标题" />
          <div className="field-row">
            <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <input value={cover} onChange={(event) => setCover(event.target.value)} placeholder="封面图 URL" />
          </div>
          <div className="checkbox-cloud">
            {tags.map((tag) => (
              <span key={tag.id}>
                <input checked={tagIds.includes(tag.id)} id={`writer-tag-${tag.id}`} onChange={(event) => setTagIds((current) => event.target.checked ? [...current, tag.id] : current.filter((tagId) => tagId !== tag.id))} type="checkbox" />
                <label htmlFor={`writer-tag-${tag.id}`}>{tag.name}</label>
              </span>
            ))}
          </div>
        </div>
        <div className="writer-editor panel">
          <span className="meta-line">Markdown</span>
          <textarea ref={editorRef} className="markdown-editor" value={body} onChange={(event) => setBody(event.target.value)} onScroll={syncEditorScroll} />
        </div>
        <div ref={previewRef} className="writer-preview panel" onScroll={syncPreviewScroll}>
          <span className="meta-line">实时预览</span>
          <h1>{preview.title}</h1>
          <MarkdownView content={preview.body} />
        </div>
      </section>
    </form>
  );
}
