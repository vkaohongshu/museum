import { Link } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { useLife } from "../../context/LifeContext";
import { TimelineItem } from "../../types";
import { articleIntro, formatShortDate, getYearMonth } from "../../utils/format";

export function PublicTimelinePage() {
  const { articles, thoughts, galleryEvents } = useLife();
  const items: TimelineItem[] = [
    ...articles.map((article) => ({ id: article.id, type: "article" as const, title: article.title, description: articleIntro(article.body), date: article.createdAt, categoryId: article.categoryId, tagIds: article.tagIds, path: `/articles/${article.id}` })),
    ...thoughts.map((thought) => ({ id: thought.id, type: "thought" as const, title: "碎碎念", description: thought.content, date: thought.createdAt, categoryId: thought.categoryId, tagIds: thought.tagIds, path: "/moments" })),
    ...galleryEvents.map((event) => ({ id: event.id, type: "gallery" as const, title: event.name, description: event.description, date: event.date, categoryId: event.categoryId, tagIds: event.tagIds, path: `/gallery/${event.id}` }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const grouped = items.reduce<Record<string, TimelineItem[]>>((result, item) => {
    const key = getYearMonth(item.date);
    result[key] = result[key] ? [...result[key], item] : [item];
    return result;
  }, {});

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Timeline" title="时间线" description="公开记录按年月串起，像一条慢慢展开的生活河流。" />
      <section className="timeline">
        {Object.entries(grouped).map(([month, monthItems]) => (
          <div className="timeline-month" key={month}>
            <h2>{month}</h2>
            <div className="timeline-items">
              {monthItems.map((item) => (
                <Link className="timeline-item" to={item.path} key={`${item.type}-${item.id}`}>
                  <span className="timeline-dot" />
                  <div>
                    <div className="timeline-meta"><span>{formatShortDate(item.date)}</span><span>{item.type}</span></div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
