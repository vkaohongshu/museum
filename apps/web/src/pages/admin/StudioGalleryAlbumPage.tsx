import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import { ArrowLeft, Eye, Star, Trash2, UploadCloud, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useLife } from "../../context/LifeContext";
import { GalleryImage } from "../../types";

type LegacyGalleryImage = GalleryImage & {
  url?: string;
  title?: string;
};

function filesToImages(files: File[]) {
  const now = new Date().toISOString();
  return Promise.all(files.map((file) => new Promise<GalleryImage>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      id: `photo-${Date.now()}-${file.name}`,
      imageUrl: String(reader.result),
      description: "",
      createdAt: now
    });
    reader.readAsDataURL(file);
  })));
}

export function StudioGalleryAlbumPage() {
  const { id } = useParams();
  const { galleryEvents, setGalleryEvents, categories, tags } = useLife();
  const album = galleryEvents.find((item) => item.id === id) ?? galleryEvents[0];
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<GalleryImage | null>(null);

  const photos = useMemo<GalleryImage[]>(() => {
    if (!album) return [];
    const details = (album.imageDetails ?? []).map((photo: LegacyGalleryImage) => ({
      id: photo.id,
      imageUrl: photo.imageUrl || photo.url || "",
      description: photo.description ?? "",
      createdAt: photo.createdAt
    })).filter((photo) => photo.imageUrl);
    const missing = album.images
      .filter((url) => !details.some((photo) => photo.imageUrl === url))
      .map((url, index) => ({ id: `legacy-${index}-${url}`, imageUrl: url, description: "", createdAt: album.date }));
    return [...details, ...missing];
  }, [album]);

  if (!album) return <div className="empty-state"><strong>没有找到相册</strong><p>请先创建一个相册。</p></div>;

  function updateAlbum(patch: Partial<typeof album>) {
    setGalleryEvents((current) => current.map((item) => item.id === album.id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item));
  }

  function updatePhotos(nextPhotos: GalleryImage[]) {
    updateAlbum({
      imageDetails: nextPhotos,
      images: nextPhotos.map((photo) => photo.imageUrl),
      cover: album.cover || nextPhotos[0]?.imageUrl || ""
    });
  }

  async function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const nextImages = await filesToImages(Array.from(fileList));
    const nextPhotos = [...photos, ...nextImages];
    updateAlbum({
      imageDetails: nextPhotos,
      images: nextPhotos.map((photo) => photo.imageUrl),
      cover: album.cover || nextImages[0]?.imageUrl || ""
    });
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    void addFiles(event.dataTransfer.files);
  }

  function onFileInput(event: ChangeEvent<HTMLInputElement>) {
    void addFiles(event.target.files);
    event.target.value = "";
  }

  function updatePhoto(id: string, patch: Partial<GalleryImage>) {
    updatePhotos(photos.map((photo) => photo.id === id ? { ...photo, ...patch } : photo));
  }

  function deletePhoto(id: string) {
    const target = photos.find((photo) => photo.id === id);
    const nextPhotos = photos.filter((photo) => photo.id !== id);
    updateAlbum({
      imageDetails: nextPhotos,
      images: nextPhotos.map((photo) => photo.imageUrl),
      cover: album.cover === target?.imageUrl ? nextPhotos[0]?.imageUrl || "" : album.cover
    });
  }

  return (
    <div className="page-stack album-detail-page">
      <Link className="back-link" to="/admin/gallery"><ArrowLeft size={17} />返回相册墙</Link>

      <section className="album-editor-hero panel">
        {album.cover ? <img src={album.cover} alt={album.name} /> : <div className="album-empty-cover"><UploadCloud size={38} /><span>还没有封面</span></div>}
        <div className="album-info-form">
          <input className="writer-title-input" value={album.name} onChange={(event) => updateAlbum({ name: event.target.value })} />
          <div className="field-row">
            <input type="date" value={album.date.slice(0, 10)} onChange={(event) => updateAlbum({ date: `${event.target.value}T09:00:00.000Z` })} />
            <input value={album.location ?? ""} onChange={(event) => updateAlbum({ location: event.target.value })} placeholder="地点" />
          </div>
          <textarea rows={4} value={album.description} onChange={(event) => updateAlbum({ description: event.target.value })} />
          <div className="field-row">
            <select value={album.categoryId} onChange={(event) => updateAlbum({ categoryId: event.target.value })}>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select>
            <div className="checkbox-cloud">{tags.map((tag) => <span key={tag.id}><input id={`album-detail-tag-${tag.id}`} type="checkbox" checked={album.tagIds.includes(tag.id)} onChange={(event) => updateAlbum({ tagIds: event.target.checked ? [...album.tagIds, tag.id] : album.tagIds.filter((id) => id !== tag.id) })} /><label htmlFor={`album-detail-tag-${tag.id}`}>{tag.name}</label></span>)}</div>
          </div>
        </div>
      </section>

      <label className={dragging ? "upload-dropzone dragging" : "upload-dropzone"} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
        <UploadCloud size={28} />
        <strong>拖拽图片到这里，或点击批量上传</strong>
        <span>上传后会真实保存到当前相册的本地状态/localStorage 中。</span>
        <input type="file" multiple accept="image/*" onChange={onFileInput} />
      </label>

      <section className="masonry-wall">
        {photos.map((photo) => (
          <article className="masonry-photo" key={photo.id}>
            <img src={photo.imageUrl} alt={photo.description || album.name} />
            <div className="photo-meta-editor">
              <textarea rows={2} value={photo.description} onChange={(event) => updatePhoto(photo.id, { description: event.target.value })} placeholder="这张照片想记录什么？" />
            </div>
            <div className="photo-actions">
              <button type="button" onClick={() => updateAlbum({ cover: photo.imageUrl })}><Star size={16} />设为封面</button>
              <button type="button" onClick={() => setPreview(photo)}><Eye size={16} />预览</button>
              <button type="button" onClick={() => deletePhoto(photo.id)}><Trash2 size={16} />删除</button>
            </div>
          </article>
        ))}
      </section>

      {preview ? (
        <div className="image-preview-modal" onClick={() => setPreview(null)}>
          <button type="button" onClick={() => setPreview(null)}><X size={18} /></button>
          <img src={preview.imageUrl} alt={preview.description || album.name} />
          {preview.description ? <p>{preview.description}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
