import { CSSProperties, FormEvent, useMemo, useState } from "react";
import { FolderOpen, Hash, Plus, Sparkles, X } from "lucide-react";
import { useCreateCategoryMutation, useDeleteCategoryMutation, useUpdateCategoryMutation } from "../api/categories";
import { useCreateTagMutation, useDeleteTagMutation, useUpdateTagMutation } from "../api/tags";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { MemoryJar, MemoryJarItem } from "../components/memory/MemoryJar";
import { useLife } from "../context/LifeContext";
import { memoryItemsFromTags, memoryStyleForName } from "../utils/insights";
import { slugifyName } from "../utils/taxonomy";

const colors = ["#f7b36f", "#89bef5", "#90ddb0", "#f47f9d", "#a891f5", "#f5d86f"];

export function TaxonomyPage() {
  const { articles, thoughts, galleryEvents, categories, tags } = useLife();
  const createCategory = useCreateCategoryMutation();
  const updateCategory = useUpdateCategoryMutation();
  const deleteCategory = useDeleteCategoryMutation();
  const createTag = useCreateTagMutation();
  const updateTag = useUpdateTagMutation();
  const deleteTag = useDeleteTagMutation();
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryColor, setCategoryColor] = useState(colors[0]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [tagName, setTagName] = useState("");
  const [selectedTagId, setSelectedTagId] = useState("");
  const contentTotal = articles.length + thoughts.length + galleryEvents.length;
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);
  const selectedTag = tags.find((tag) => tag.id === selectedTagId);

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

  const memoryItems = useMemo(() => memoryItemsFromTags(tags, tagUsage), [tags, tagUsage]);

  function categoryIcon(name: string) {
    if (/书|阅读|文章|写作/.test(name)) return "📚";
    if (/旅行|城市|路|远方/.test(name)) return "✈️";
    if (/影|电影|剧/.test(name)) return "🎞️";
    if (/运动|健身|身体/.test(name)) return "💪";
    if (/生活|日常|家/.test(name)) return "🌿";
    return "✨";
  }

  function addCategory(event: FormEvent) {
    event.preventDefault();
    if (!categoryName.trim()) return;
    createCategory.mutate({ id: `${slugifyName(categoryName)}-${Date.now()}`, name: categoryName.trim(), description: categoryDescription.trim(), color: categoryColor });
    setCategoryName("");
    setCategoryDescription("");
  }

  function addTag(event: FormEvent) {
    event.preventDefault();
    if (!tagName.trim()) return;
    const style = memoryStyleForName(tagName, colors[tags.length % colors.length]);
    createTag.mutate({ id: `${slugifyName(tagName)}-${Date.now()}`, name: tagName.trim(), color: style.color });
    setTagName("");
  }

  function openTagDrawer(item: MemoryJarItem) {
    setSelectedTagId(item.id);
  }

  function updateSelectedCategory(patch: Partial<typeof selectedCategory>) {
    if (!selectedCategory) return;
    updateCategory.mutate({ id: selectedCategory.id, category: { ...selectedCategory, ...patch } });
  }

  function deleteSelectedCategory() {
    if (!selectedCategory) return;
    deleteCategory.mutate(selectedCategory.id);
    setSelectedCategoryId("");
  }

  function updateSelectedTagName(name: string) {
    if (!selectedTag) return;
    updateTag.mutate({ id: selectedTag.id, tag: { ...selectedTag, name } });
  }

  function updateSelectedTagColor(color: string) {
    if (!selectedTag) return;
    updateTag.mutate({ id: selectedTag.id, tag: { ...selectedTag, color } });
  }

  function deleteSelectedTag() {
    if (!selectedTag) return;
    deleteTag.mutate(selectedTag.id);
    setSelectedTagId("");
  }

  return (
    <div className="page-stack taxonomy-studio">
      <PageHeader eyebrow="Taxonomy Studio" title="分类与标签工作室" description="把生活记录整理成温柔的方向与线索，而不是冷冰冰的管理表。" />

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
          <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="分类名称，比如旅行" />
          <input value={categoryDescription} onChange={(event) => setCategoryDescription(event.target.value)} placeholder="这一类记录什么？" />
          <input type="color" value={categoryColor} onChange={(event) => setCategoryColor(event.target.value)} />
          <button className="primary-button" type="submit">新增分类</button>
        </form>
        <div className="category-card-list">
          {categories.map((category) => (
            <button className="category-manage-card" key={category.id} style={{ "--category-color": category.color } as CSSProperties} onClick={() => setSelectedCategoryId(category.id)} type="button">
              <span>{categoryIcon(category.name)}</span>
              <strong>{category.name}</strong>
              <p>{category.description || "还没有描述，等一段生活来命名它。"}</p>
              <small>{categoryUsage.get(category.id) ?? 0} 条内容</small>
            </button>
          ))}
        </div>
      </section>

      <section className="panel taxonomy-tag-panel memory-tag-studio">
        <MemoryJar
          action={(
            <form className="memory-tag-add-form" onSubmit={addTag}>
              <input value={tagName} onChange={(event) => setTagName(event.target.value)} placeholder="添加新标签" />
              <button aria-label="添加新标签" className="primary-button" type="submit"><Plus size={18} /> 添加</button>
            </form>
          )}
          emptyText="先写下一个主题，再把它放进记忆瓶"
          items={memoryItems}
          onBallClick={openTagDrawer}
          size="large"
          subtitle="点击标签球，整理它的名称与颜色；常出现的主题会慢慢沉在瓶底。"
          title="记忆瓶"
        />
      </section>

      {selectedCategory ? (
        <div className="drawer-backdrop" onClick={() => setSelectedCategoryId("")}>
          <aside className="edit-drawer taxonomy-edit-drawer" onClick={(event) => event.stopPropagation()}>
            <button aria-label="关闭" className="memory-drawer-close" onClick={() => setSelectedCategoryId("")} type="button"><X size={18} /></button>
            <span className="eyebrow">Category</span>
            <h2>{selectedCategory.name}</h2>
            <p>{categoryUsage.get(selectedCategory.id) ?? 0} 条内容正在归入这个方向。</p>
            <label>
              分类名称
              <input defaultValue={selectedCategory.name} onBlur={(event) => updateSelectedCategory({ name: event.target.value })} />
            </label>
            <label>
              描述
              <textarea rows={4} defaultValue={selectedCategory.description ?? ""} onBlur={(event) => updateSelectedCategory({ description: event.target.value })} />
            </label>
            <label>
              颜色
              <input type="color" value={selectedCategory.color} onChange={(event) => updateSelectedCategory({ color: event.target.value })} />
            </label>
            <div className="button-row">
              <button className="primary-button" onClick={() => setSelectedCategoryId("")} type="button">保存</button>
              <button className="secondary-button" onClick={deleteSelectedCategory} type="button">删除分类</button>
            </div>
          </aside>
        </div>
      ) : null}

      {selectedTag ? (
        <div className="drawer-backdrop" onClick={() => setSelectedTagId("")}>
          <aside className="edit-drawer memory-tag-drawer" onClick={(event) => event.stopPropagation()}>
            <button aria-label="关闭" className="memory-drawer-close" onClick={() => setSelectedTagId("")} type="button"><X size={18} /></button>
            <span className="eyebrow">Memory Label</span>
            <h2>{selectedTag.name}</h2>
            <p>这个标签已经连接了 {tagUsage.get(selectedTag.id) ?? selectedTag.usageCount ?? 0} 条内容。</p>
            <label>
              标签名称
              <input defaultValue={selectedTag.name} onBlur={(event) => updateSelectedTagName(event.target.value)} />
            </label>
            <label>
              记忆球颜色
              <input type="color" value={selectedTag.color} onChange={(event) => updateSelectedTagColor(event.target.value)} />
            </label>
            <div className="button-row">
              <button className="primary-button" onClick={() => setSelectedTagId("")} type="button">收好</button>
              <button className="secondary-button" onClick={deleteSelectedTag} type="button">删除标签</button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
