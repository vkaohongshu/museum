import { CSSProperties, FormEvent, useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { TagPill } from "../components/TagPill";
import { useLife } from "../context/LifeContext";
import { slugifyName } from "../utils/taxonomy";
import { FolderOpen, Hash, Sparkles } from "lucide-react";

const colors = ["#ffb84d", "#5aa9ff", "#35c88a", "#ff7b72", "#9b8cff", "#f2c94c"];

export function TaxonomyPage() {
  const { articles, thoughts, galleryEvents, categories, setCategories, tags, setTags } = useLife();
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryColor, setCategoryColor] = useState(colors[0]);
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [tagName, setTagName] = useState("");
  const [tagQuery, setTagQuery] = useState("");
  const [tagSort, setTagSort] = useState<"usage" | "name">("usage");
  const contentTotal = articles.length + thoughts.length + galleryEvents.length;
  const categoryUsage = useMemo(() => {
    const count = new Map<string, number>();
    [...articles.map((item) => item.categoryId), ...thoughts.map((item) => item.categoryId), ...galleryEvents.map((item) => item.categoryId)].forEach((id) => count.set(id, (count.get(id) ?? 0) + 1));
    return count;
  }, [articles, thoughts, galleryEvents]);
  const tagUsage = useMemo(() => {
    const count = new Map<string, number>();
    [...articles.flatMap((item) => item.tagIds), ...thoughts.flatMap((item) => item.tagIds), ...galleryEvents.flatMap((item) => item.tagIds)].forEach((id) => count.set(id, (count.get(id) ?? 0) + 1));
    return count;
  }, [articles, thoughts, galleryEvents]);
  const filteredTags = [...tags]
    .filter((tag) => tag.name.toLowerCase().includes(tagQuery.toLowerCase()))
    .sort((a, b) => tagSort === "usage" ? (tagUsage.get(b.id) ?? 0) - (tagUsage.get(a.id) ?? 0) : a.name.localeCompare(b.name, "zh-CN"));

  function categoryIcon(categoryName: string) {
    if (/读|书|阅读/.test(categoryName)) return "📚";
    if (/旅|行|城市|路/.test(categoryName)) return "✈️";
    if (/影|电影|剧/.test(categoryName)) return "🎬";
    if (/健|跑|身体/.test(categoryName)) return "💪";
    if (/生活|日常|家/.test(categoryName)) return "🌱";
    return "✨";
  }

  function addCategory(event: FormEvent) {
    event.preventDefault();
    if (!categoryName.trim()) return;
    setCategories((current) => [...current, { id: `${slugifyName(categoryName)}-${Date.now()}`, name: categoryName.trim(), description: categoryDescription.trim(), color: categoryColor }]);
    setCategoryName("");
    setCategoryDescription("");
  }

  function addTag(event: FormEvent) {
    event.preventDefault();
    if (!tagName.trim()) return;
    setTags((current) => [...current, { id: `${slugifyName(tagName)}-${Date.now()}`, name: tagName.trim(), color: colors[current.length % colors.length] }]);
    setTagName("");
  }

  return (
    <div className="page-stack taxonomy-studio">
      <PageHeader eyebrow="Taxonomy Studio" title="分类与标签工作台" description="把生活记录整理成温柔的方向与线索，而不是冷冰冰的管理表。" />

      <section className="stats-grid taxonomy-stats">
        <StatCard label="分类数量" value={categories.length} tone="sun" icon={FolderOpen} />
        <StatCard label="标签数量" value={tags.length} tone="sky" icon={Hash} />
        <StatCard label="内容总数" value={contentTotal} tone="mint" icon={Sparkles} />
      </section>

      <section className="panel taxonomy-gallery-panel">
        <div className="section-title">
          <h2>分类卡片墙</h2>
        </div>
        <form className="taxonomy-create-form" onSubmit={addCategory}>
          <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="分类名称，比如 旅行" />
          <input value={categoryDescription} onChange={(event) => setCategoryDescription(event.target.value)} placeholder="这一类记录什么？" />
          <input type="color" value={categoryColor} onChange={(event) => setCategoryColor(event.target.value)} />
          <button className="primary-button" type="submit">新增分类</button>
        </form>
        <div className="category-card-list">
          {categories.map((category) => {
            const isEditing = editingCategoryId === category.id;
            return (
              <article className={isEditing ? "category-manage-card editing" : "category-manage-card"} key={category.id} style={{ "--category-color": category.color } as CSSProperties} onClick={() => setEditingCategoryId(category.id)}>
                <div className="category-card-face">
                  <span>{categoryIcon(category.name)}</span>
                  <strong>{category.name}</strong>
                  <p>{category.description || "还没有描述，等一段生活来命名它。"}</p>
                  <small>{categoryUsage.get(category.id) ?? 0} 条内容</small>
                </div>
                {isEditing ? (
                  <div className="category-edit-fields" onClick={(event) => event.stopPropagation()}>
                    <input value={category.name} onChange={(event) => setCategories((current) => current.map((item) => item.id === category.id ? { ...item, name: event.target.value } : item))} />
                    <textarea rows={2} value={category.description ?? ""} onChange={(event) => setCategories((current) => current.map((item) => item.id === category.id ? { ...item, description: event.target.value } : item))} />
                    <div className="button-row">
                      <input type="color" value={category.color} onChange={(event) => setCategories((current) => current.map((item) => item.id === category.id ? { ...item, color: event.target.value } : item))} />
                      <button type="button" onClick={() => setEditingCategoryId("")}>完成</button>
                      <button type="button" onClick={() => setCategories((current) => current.filter((item) => item.id !== category.id))}>删除</button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel taxonomy-tag-panel">
        <div className="section-title"><h2>标签云</h2></div>
        <div className="tag-workbench-bar">
          <form className="inline-form" onSubmit={addTag}>
            <input value={tagName} onChange={(event) => setTagName(event.target.value)} placeholder="快速新增标签" />
            <button className="primary-button" type="submit">新增</button>
          </form>
          <input value={tagQuery} onChange={(event) => setTagQuery(event.target.value)} placeholder="搜索标签" />
          <select value={tagSort} onChange={(event) => setTagSort(event.target.value as "usage" | "name")}>
            <option value="usage">按使用次数</option>
            <option value="name">按名称</option>
          </select>
        </div>
        <div className="tag-cloud-manager">
          {filteredTags.map((tag) => (
            <button key={tag.id} type="button" style={{ "--tag-scale": 1 + Math.min((tagUsage.get(tag.id) ?? 0) * 0.08, 0.35) } as CSSProperties} onClick={() => {
              const next = window.prompt("编辑标签名称", tag.name);
              if (next) setTags((current) => current.map((item) => item.id === tag.id ? { ...item, name: next } : item));
            }}>
              <TagPill item={tag} />
              <small>{tagUsage.get(tag.id) ?? 0}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
