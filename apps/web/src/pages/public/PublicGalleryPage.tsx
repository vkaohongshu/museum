import { Link } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { TagPill } from "../../components/TagPill";
import { useLife } from "../../context/LifeContext";
import { formatDate } from "../../utils/format";
import { categoryById, tagsByIds } from "../../utils/taxonomy";

export function PublicGalleryPage() {
  const { galleryEvents, categories, tags, isLoading, isError, error } = useLife();
  const publicEvents = galleryEvents;

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Event Gallery" title="图库" description="公开的照片事件和生活场景。" />
      {isLoading ? <div className="empty-state"><strong>Loading...</strong></div> : null}
      {isError ? <div className="empty-state"><strong>API Error</strong><p>{error?.message}</p></div> : null}
      <section className="gallery-grid">
        {publicEvents.length ? publicEvents.map((event) => (
          <Link className="gallery-card" to={`/gallery/${event.id}`} key={event.id}>
            {event.cover ? <img src={event.cover} alt={event.name} /> : <div className="album-empty-cover">暂无封面</div>}
            <div className="gallery-card-body">
              <div className="meta-line">{formatDate(event.date)} · {event.images.length} 张图片</div>
              <h2>{event.name}</h2>
              <p>{event.description}</p>
              <div className="pill-row">
                <TagPill item={categoryById(categories, event.categoryId)} />
                {tagsByIds(tags, event.tagIds).map((tag) => <TagPill key={tag.id} item={tag} subtle />)}
              </div>
            </div>
          </Link>
        )) : <div className="empty-state"><strong>No albums</strong></div>}
      </section>
    </div>
  );
}
