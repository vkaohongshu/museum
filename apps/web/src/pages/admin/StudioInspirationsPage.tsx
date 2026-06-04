import { CSSProperties, FormEvent, useMemo, useState } from "react";
import { Eye, MapPin, PenLine, Plane, ShoppingBag, Sparkles, Trash2, X } from "lucide-react";
import { useLife } from "../../context/LifeContext";
import { InspirationStatus, InspirationType } from "../../types";
import { formatShortDate } from "../../utils/format";

const filters: ("全部" | InspirationType)[] = ["全部", "想写", "想去", "想做", "想看", "想买"];
const statuses: InspirationStatus[] = ["待实现", "已实现", "暂不考虑"];

const typeIcons = {
  想写: PenLine,
  想去: Plane,
  想看: Eye,
  想做: Sparkles,
  想买: ShoppingBag,
  其他: MapPin
} satisfies Record<InspirationType, typeof PenLine>;

export function StudioInspirationsPage() {
  const { inspirations, setInspirations } = useLife();
  const [filter, setFilter] = useState<"全部" | InspirationType>("全部");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<InspirationType>("想写");
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = inspirations.find((idea) => idea.id === activeId) ?? null;
  const filtered = useMemo(() => inspirations.filter((idea) => filter === "全部" || idea.type === filter), [filter, inspirations]);

  function add(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    const now = new Date().toISOString();
    const next = {
      id: `idea-${Date.now()}`,
      title,
      content: "新的灵感，可以继续补充细节。",
      type,
      status: "待实现" as InspirationStatus,
      tags: ["灵感"],
      createdAt: now,
      updatedAt: now
    };
    setInspirations((current) => [next, ...current]);
    setTitle("");
    setActiveId(next.id);
  }

  function updateActive(patch: Partial<typeof active>) {
    if (!active) return;
    setInspirations((current) => current.map((item) => item.id === active.id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item));
  }

  return (
    <div className="page-stack">
      <header className="studio-section-hero panel">
        <span>Inspiration Cards</span>
        <h1>灵感卡片看板</h1>
        <p>用轻量卡片收纳想写、想去、想做、想看和想买的念头。</p>
        <form className="quick-create-form" onSubmit={add}>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="新的灵感" />
          <select value={type} onChange={(event) => setType(event.target.value as InspirationType)}>
            {filters.filter((item) => item !== "全部").map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="primary-button" type="submit">添加灵感</button>
        </form>
      </header>

      <div className="inspiration-filter">
        {filters.map((item) => <button className={filter === item ? "active" : ""} type="button" key={item} onClick={() => setFilter(item)}>{item}</button>)}
      </div>

      <section className="inspiration-card-grid">
        {filtered.map((idea) => {
          const Icon = typeIcons[idea.type];
          return (
            <article className="idea-card" key={idea.id} onClick={() => setActiveId(idea.id)}>
              <div className="idea-card-top">
                <span><Icon size={17} />{idea.type}</span>
                <select value={idea.status} onClick={(event) => event.stopPropagation()} onChange={(event) => setInspirations((current) => current.map((item) => item.id === idea.id ? { ...item, status: event.target.value as InspirationStatus, updatedAt: new Date().toISOString() } : item))}>
                  {statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
              <h2>{idea.title}</h2>
              <p>{idea.content}</p>
              <div className="pill-row">{idea.tags.map((tag) => <span className="pill pill-subtle" style={{ "--pill-color": "#ffb84d" } as CSSProperties} key={tag}>{tag}</span>)}</div>
              <footer>
                <small>{formatShortDate(idea.createdAt)}</small>
                <button type="button" onClick={(event) => { event.stopPropagation(); setInspirations((current) => current.filter((item) => item.id !== idea.id)); }}><Trash2 size={15} />删除</button>
              </footer>
            </article>
          );
        })}
      </section>

      {active ? (
        <div className="drawer-backdrop inspiration-drawer-backdrop" onClick={() => setActiveId(null)}>
          <aside className="edit-drawer inspiration-edit-drawer" onClick={(event) => event.stopPropagation()}>
            <button aria-label="关闭" className="memory-drawer-close" type="button" onClick={() => setActiveId(null)}><X size={18} /></button>
            <span className="eyebrow">Inspiration</span>
            <label>
              标题
              <input value={active.title} onChange={(event) => updateActive({ title: event.target.value })} />
            </label>
            <label>
              内容
              <textarea rows={8} value={active.content} onChange={(event) => updateActive({ content: event.target.value })} />
            </label>
            <button className="primary-button" type="button" onClick={() => setActiveId(null)}>保存</button>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
