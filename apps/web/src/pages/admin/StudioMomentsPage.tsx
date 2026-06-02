import { ImagePlus, Send, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { TagPill } from "../../components/TagPill";
import { useLife } from "../../context/LifeContext";
import { formatShortDate } from "../../utils/format";
import { tagsByIds } from "../../utils/taxonomy";

export function StudioMomentsPage() {
  const { thoughts, setThoughts, categories, tags } = useLife();
  const [content, setContent] = useState("");
  const [imageText, setImageText] = useState("");

  function publish(event: FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    const now = new Date().toISOString();
    setThoughts((current) => [{
      id: `thought-${Date.now()}`,
      content,
      images: imageText.split(/\n|,/).map((item) => item.trim()).filter(Boolean),
      categoryId: categories[0]?.id ?? "life",
      tagIds: [],
      createdAt: now,
      updatedAt: now,
      relatedItems: []
    }, ...current]);
    setContent("");
    setImageText("");
  }

  return (
    <div className="studio-moments page-stack">
      <form className="moment-composer panel" onSubmit={publish}>
        <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="今天发生了什么小事？" rows={3} />
        <input value={imageText} onChange={(event) => setImageText(event.target.value)} placeholder="图片 URL，可多个逗号分隔" />
        <div className="composer-actions">
          <button className="ghost-button" type="button"><ImagePlus size={18} />图片</button>
          <button className="primary-button" type="submit"><Send size={18} />发布</button>
        </div>
      </form>

      <section className="moment-masonry">
        {thoughts.map((moment) => (
          <article className="moment-masonry-card" key={moment.id}>
            {moment.images.length ? <div className="moment-card-images">{moment.images.map((image) => <img src={image} alt="碎碎念配图" key={image} />)}</div> : null}
            <textarea value={moment.content} onChange={(event) => setThoughts((current) => current.map((item) => item.id === moment.id ? { ...item, content: event.target.value, updatedAt: new Date().toISOString() } : item))} />
            <div className="pill-row">{tagsByIds(tags, moment.tagIds).map((tag) => <TagPill key={tag.id} item={tag} subtle />)}</div>
            <footer>
              <time>{formatShortDate(moment.createdAt)}</time>
              <button type="button" onClick={() => setThoughts((current) => current.filter((item) => item.id !== moment.id))}><Trash2 size={15} />删除</button>
            </footer>
          </article>
        ))}
      </section>
    </div>
  );
}
