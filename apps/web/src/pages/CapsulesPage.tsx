import { PageHeader } from "../components/PageHeader";
import { TagPill } from "../components/TagPill";
import { useLife } from "../context/LifeContext";
import { formatDate } from "../utils/format";
import { categoryById, tagsByIds } from "../utils/taxonomy";

export function CapsulesPage() {
  const { capsules, categories, tags } = useLife();

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Memory Capsules"
        title="记忆胶囊"
        description="预留去年今日、某年今日和情绪回顾能力。"
      />

      <section className="capsule-grid">
        {capsules.map((capsule) => (
          <article className="capsule-card" key={capsule.id}>
            <img src={capsule.image} alt={capsule.title} />
            <div>
              <span>{formatDate(capsule.date)} · {capsule.mood}</span>
              <h2>{capsule.title}</h2>
              <p>{capsule.body}</p>
              <div className="pill-row">
                <TagPill item={categoryById(categories, capsule.categoryId)} />
                {tagsByIds(tags, capsule.tagIds).map((tag) => <TagPill key={tag.id} item={tag} subtle />)}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
