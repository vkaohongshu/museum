import { PageHeader } from "../../components/PageHeader";
import { TagPill } from "../../components/TagPill";
import { useLife } from "../../context/LifeContext";
import { formatShortDate } from "../../utils/format";
import { categoryById, tagsByIds } from "../../utils/taxonomy";

export function PublicMomentsPage() {
  const { thoughts, categories, tags, isLoading, isError, error } = useLife();
  const publicThoughts = thoughts;

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Moments" title="碎碎念" description="公开的小片段、心情和瞬间。" />
      {isLoading ? <div className="empty-state"><strong>Loading...</strong></div> : null}
      {isError ? <div className="empty-state"><strong>API Error</strong><p>{error?.message}</p></div> : null}
      <section className="moment-masonry public-moment-masonry">
        {publicThoughts.length ? publicThoughts.map((thought) => (
          <article className="moment-masonry-card public-moment-card" key={thought.id}>
            <div className="thought-top">
              <TagPill item={categoryById(categories, thought.categoryId)} />
              <span>{formatShortDate(thought.createdAt)}</span>
            </div>
            <p>{thought.content}</p>
            {thought.images.length ? <div className="moment-card-images">{thought.images.map((image) => <img src={image} alt="碎碎念配图" key={image} />)}</div> : null}
            <div className="pill-row">{tagsByIds(tags, thought.tagIds).map((tag) => <TagPill key={tag.id} item={tag} subtle />)}</div>
          </article>
        )) : <div className="empty-state"><strong>No moments</strong></div>}
      </section>
    </div>
  );
}
