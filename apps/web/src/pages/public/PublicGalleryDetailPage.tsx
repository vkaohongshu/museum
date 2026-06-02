import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { RelatedContentList } from "../../components/RelatedContentList";
import { TagPill } from "../../components/TagPill";
import { useLife } from "../../context/LifeContext";
import { formatDate } from "../../utils/format";
import { categoryById, tagsByIds } from "../../utils/taxonomy";

type GalleryPhotoView = {
  id: string;
  imageUrl: string;
  description: string;
};

export function PublicGalleryDetailPage() {
  const { id } = useParams();
  const { galleryEvents, articles, categories, tags } = useLife();
  const event = galleryEvents.find((item) => item.id === id);

  if (!event) {
    return <div className="empty-state"><strong>图库不可访问</strong><p>这个图片事件不存在。</p></div>;
  }

  const articleIds = event.linkedArticleIds.filter((articleId) => articles.some((article) => article.id === articleId));
  const photoDetails = (event.imageDetails ?? []).map((photo) => ({
    id: photo.id,
    imageUrl: photo.imageUrl || (photo as typeof photo & { url?: string }).url || "",
    description: photo.description ?? ""
  })).filter((photo) => photo.imageUrl);
  const photos: GalleryPhotoView[] = [
    ...photoDetails,
    ...event.images
      .filter((image) => !photoDetails.some((photo) => photo.imageUrl === image))
      .map((image, index) => ({ id: `legacy-${index}-${image}`, imageUrl: image, description: "" }))
  ];

  return (
    <div className="page-stack">
      <Link className="back-link" to="/gallery"><ArrowLeft size={17} />返回图库</Link>
      <section className="gallery-hero">
        {event.cover ? <img src={event.cover} alt={event.name} /> : <div className="album-empty-cover">暂无封面</div>}
        <div>
          <div className="pill-row">
            <TagPill item={categoryById(categories, event.categoryId)} />
            {tagsByIds(tags, event.tagIds).map((tag) => <TagPill key={tag.id} item={tag} subtle />)}
          </div>
          <h1>{event.name}</h1>
          <p>{event.description}</p>
          <span>{formatDate(event.date)} · {event.images.length} 张图片</span>
        </div>
      </section>
      <section className="photo-wall">
        {photos.map((photo, index) => (
          <figure className="photo-tile" key={photo.id}>
            <a href={photo.imageUrl} target="_blank" rel="noreferrer">
              <img src={photo.imageUrl} alt={photo.description || `${event.name} 第 ${index + 1} 张`} />
              <span>查看大图</span>
            </a>
            {photo.description ? <figcaption>{photo.description}</figcaption> : null}
          </figure>
        ))}
      </section>
      <RelatedContentList articleIds={articleIds} />
    </div>
  );
}
