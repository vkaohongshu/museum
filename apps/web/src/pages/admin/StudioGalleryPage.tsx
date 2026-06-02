import { FormEvent, useState } from "react";
import { ImagePlus, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { TagPill } from "../../components/TagPill";
import { useLife } from "../../context/LifeContext";

export function StudioGalleryPage() {
  const { galleryEvents, setGalleryEvents, categories, tags } = useLife();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("");
  const [cover, setCover] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "life");
  const [tagIds, setTagIds] = useState<string[]>([]);

  function reset() {
    setName("");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    setLocation("");
    setCover("");
    setCategoryId(categories[0]?.id ?? "life");
    setTagIds([]);
  }

  function createAlbum(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    const now = new Date().toISOString();
    const id = `gallery-${Date.now()}`;
    setGalleryEvents((current) => [{
      id,
      name: name.trim(),
      description: description.trim(),
      date: `${date}T09:00:00.000Z`,
      location: location.trim(),
      createdAt: now,
      updatedAt: now,
      cover: cover.trim(),
      images: [],
      imageDetails: [],
      linkedArticleIds: [],
      categoryId,
      tagIds,
      relatedItems: []
    }, ...current]);
    reset();
    setOpen(false);
  }

  return (
    <div className="page-stack">
      <header className="studio-section-hero panel">
        <span>Albums</span>
        <h1>事件相册</h1>
        <p>为旅行、散步、健身和日常片段创建相册，再进入相册上传与整理照片。</p>
        <button className="primary-button" type="button" onClick={() => setOpen(true)}><Plus size={17} />创建相册</button>
      </header>

      {open ? (
        <section className="panel album-create-panel">
          <div className="section-title">
            <h2>创建新相册</h2>
            <button className="ghost-button" type="button" onClick={() => setOpen(false)}><X size={17} />关闭</button>
          </div>
          <form className="editor-form" onSubmit={createAlbum}>
            <div className="field-row">
              <label>相册名称<input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：东京旅行" /></label>
              <label>时间<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
            </div>
            <div className="field-row">
              <label>地点<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="例如：东京 / 上海 / 阳台" /></label>
              <label>封面图 URL<input value={cover} onChange={(event) => setCover(event.target.value)} placeholder="可选，也可以进入相册后设置封面" /></label>
            </div>
            <label>描述<textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="这组照片记录了什么？" /></label>
            <div className="field-row">
              <label>分类<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <label>标签<div className="checkbox-cloud">{tags.map((tag) => <span key={tag.id}><input id={`album-tag-${tag.id}`} type="checkbox" checked={tagIds.includes(tag.id)} onChange={(event) => setTagIds((current) => event.target.checked ? [...current, tag.id] : current.filter((id) => id !== tag.id))} /><label htmlFor={`album-tag-${tag.id}`}>{tag.name}</label></span>)}</div></label>
            </div>
            <button className="primary-button" type="submit">保存相册</button>
          </form>
        </section>
      ) : null}

      <section className="album-wall">
        {galleryEvents.map((album) => (
          <Link className="album-card" to={`/admin/gallery/${album.id}`} key={album.id}>
            {album.cover ? <img src={album.cover} alt={album.name} /> : <div className="album-empty-cover"><ImagePlus size={34} /><span>进入后上传图片</span></div>}
            <div>
              <div className="pill-row">
                <TagPill item={categories.find((category) => category.id === album.categoryId)} />
              </div>
              <h2>{album.name}</h2>
              <p>{album.description || "还没有描述。"}</p>
              <span><ImagePlus size={15} />{album.images.length} 张图片 {album.location ? `· ${album.location}` : ""}</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
