import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Eye, Star, Trash2, UploadCloud, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useDeleteAlbumPhotoMutation, useUpdateAlbumMutation, useUpdateAlbumPhotoMutation, useUploadAlbumPhotosMutation } from "../../api/albums";
import { useLife } from "../../context/LifeContext";
import { GalleryImage } from "../../types";

type LegacyGalleryImage = GalleryImage & {
  url?: string;
  title?: string;
};

export function StudioGalleryAlbumPage() {
  const { id } = useParams();
  const { galleryEvents, categories, tags } = useLife();
  const album = galleryEvents.find((item) => item.id === id) ?? galleryEvents[0];
  const albumId = album?.id ?? "";
  const updateAlbumMutation = useUpdateAlbumMutation();
  const uploadPhotosMutation = useUploadAlbumPhotosMutation(albumId);
  const updatePhotoMutation = useUpdateAlbumPhotoMutation(albumId);
  const deletePhotoMutation = useDeleteAlbumPhotoMutation(albumId);
  const [dragging, setDragging] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

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

  const preview = previewIndex === null ? null : photos[previewIndex];

  function updateAlbum(patch: Partial<typeof album>) {
    updateAlbumMutation.mutate({ id: album.id, album: { ...album, ...patch } });
  }

  async function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    uploadPhotosMutation.mutate({ files: Array.from(fileList) });
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
    const photo = photos.find((item) => item.id === id);
    updatePhotoMutation.mutate({ id, description: patch.description ?? photo?.description ?? "" });
  }

  function deletePhoto(id: string) {
    deletePhotoMutation.mutate(id);
    if (previewIndex !== null) setPreviewIndex(null);
  }

  function shiftPreview(offset: number) {
    if (previewIndex === null || photos.length === 0) return;
    setPreviewIndex((previewIndex + offset + photos.length) % photos.length);
  }

  return (
    <div className="page-stack album-detail-page">
      <Link className="back-link" to="/admin/gallery"><ArrowLeft size={17} />返回相册墙</Link>

      <section className="album-editor-hero panel">
        {album.cover ? <img src={album.cover} alt={album.name} /> : <div className="album-empty-cover"><UploadCloud size={38} /><span>还没有封面</span></div>}
        <div className="album-info-form">
          <input className="writer-title-input" defaultValue={album.name} onBlur={(event) => updateAlbum({ name: event.target.value })} />
          <div className="field-row">
            <input type="date" defaultValue={album.date.slice(0, 10)} onBlur={(event) => updateAlbum({ date: `${event.target.value}T09:00:00.000Z` })} />
            <input defaultValue={album.location ?? ""} onBlur={(event) => updateAlbum({ location: event.target.value })} placeholder="地点" />
          </div>
          <textarea rows={4} defaultValue={album.description} onBlur={(event) => updateAlbum({ description: event.target.value })} />
          <div className="field-row">
            <select value={album.categoryId} onChange={(event) => updateAlbum({ categoryId: event.target.value })}>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select>
            <div className="checkbox-cloud">{tags.map((tag) => <span key={tag.id}><input id={`album-detail-tag-${tag.id}`} type="checkbox" checked={album.tagIds.includes(tag.id)} onChange={(event) => updateAlbum({ tagIds: event.target.checked ? [...album.tagIds, tag.id] : album.tagIds.filter((tagId) => tagId !== tag.id) })} /><label htmlFor={`album-detail-tag-${tag.id}`}>{tag.name}</label></span>)}</div>
          </div>
        </div>
      </section>

      <label className={dragging ? "upload-dropzone dragging" : "upload-dropzone"} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
        <UploadCloud size={28} />
        <strong>拖拽图片到这里，或点击批量上传</strong>
        <span>上传后会保存到当前相册的本地状态中。</span>
        <input type="file" multiple accept="image/*" onChange={onFileInput} />
      </label>

      <section className="masonry-wall">
        {photos.map((photo, index) => {
          const isCover = album.cover === photo.imageUrl;
          return (
            <article className={isCover ? "masonry-photo is-cover" : "masonry-photo"} key={photo.id}>
              <div className="photo-frame">
                <img src={photo.imageUrl} alt={photo.description || album.name} />
                {isCover ? <span className="cover-badge"><CheckCircle2 size={14} />当前封面</span> : null}
              </div>
              <div className="photo-meta-editor">
                <textarea rows={2} defaultValue={photo.description} onBlur={(event) => updatePhoto(photo.id, { description: event.target.value })} placeholder="这张照片想记录什么？" />
              </div>
              <div className="photo-actions">
                <button type="button" disabled={isCover} onClick={() => updateAlbum({ cover: photo.imageUrl })}><Star size={16} />{isCover ? "已设为封面" : "设为封面"}</button>
                <button type="button" onClick={() => setPreviewIndex(index)}><Eye size={16} />预览</button>
                <button type="button" onClick={() => deletePhoto(photo.id)}><Trash2 size={16} />删除</button>
              </div>
            </article>
          );
        })}
      </section>

      {preview ? (
        <div className="image-preview-modal gallery-preview-modal" onClick={() => setPreviewIndex(null)}>
          <button className="preview-close" type="button" onClick={() => setPreviewIndex(null)}><X size={18} /></button>
          {photos.length > 1 ? <button className="preview-nav preview-prev" type="button" onClick={(event) => { event.stopPropagation(); shiftPreview(-1); }}><ChevronLeft size={24} /></button> : null}
          <figure className="gallery-preview-frame" onClick={(event) => event.stopPropagation()}>
            <img src={preview.imageUrl} alt={preview.description || album.name} />
            {preview.description ? <figcaption>{preview.description}</figcaption> : null}
          </figure>
          {photos.length > 1 ? <button className="preview-nav preview-next" type="button" onClick={(event) => { event.stopPropagation(); shiftPreview(1); }}><ChevronRight size={24} /></button> : null}
        </div>
      ) : null}
    </div>
  );
}
