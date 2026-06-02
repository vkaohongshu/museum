import { Link } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { TagPill } from "../../components/TagPill";
import { useLife } from "../../context/LifeContext";
import { articleIntro, formatDate } from "../../utils/format";
import { categoryById, tagsByIds } from "../../utils/taxonomy";

export function PublicArticlesPage() {
  const { articles, categories, tags, isLoading, isError, error } = useLife();
  const publicArticles = articles;

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Articles" title="文章" description="公开的长文、读书笔记和生活记录。" />
      {isLoading ? <div className="empty-state"><strong>Loading...</strong></div> : null}
      {isError ? <div className="empty-state"><strong>API Error</strong><p>{error?.message}</p></div> : null}
      <section className="card-grid article-card-grid">
        {publicArticles.length ? publicArticles.map((article) => (
          <Link to={`/articles/${article.id}`} className="content-card article-card" key={article.id}>
            <img src={article.cover} alt={article.title} />
            <div className="content-card-body">
              <div className="meta-line">{formatDate(article.createdAt)} · {article.readMinutes} 分钟阅读</div>
              <h2>{article.title}</h2>
              <p>{articleIntro(article.body)}</p>
              <div className="pill-row">
                <TagPill item={categoryById(categories, article.categoryId)} />
                {tagsByIds(tags, article.tagIds).map((tag) => <TagPill key={tag.id} item={tag} subtle />)}
              </div>
            </div>
          </Link>
        )) : <div className="empty-state"><strong>No articles</strong></div>}
      </section>
    </div>
  );
}
