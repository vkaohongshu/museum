import { ArrowRight, FileText, Image, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { StatCard } from "../../components/StatCard";
import { TagPill } from "../../components/TagPill";
import { useLife } from "../../context/LifeContext";
import { articleIntro, formatShortDate } from "../../utils/format";
import { categoryById } from "../../utils/taxonomy";

export function PublicHomePage() {
  const { settings, articles, thoughts, galleryEvents, categories, isLoading, isError, error } = useLife();
  const publicArticles = articles;
  const publicThoughts = thoughts;
  const publicGalleries = galleryEvents;
  const recentGallery = publicGalleries[0];

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Life Museum"
        title={settings.siteName}
        description={`${settings.homeWelcome} ${settings.siteDescription}`}
      />
      {isLoading ? <div className="empty-state"><strong>Loading...</strong></div> : null}
      {isError ? <div className="empty-state"><strong>API Error</strong><p>{error?.message}</p></div> : null}

      <section className="stats-grid">
        <StatCard label="文章" value={publicArticles.length} tone="sun" icon={FileText} />
        <StatCard label="碎碎念" value={publicThoughts.length} tone="sky" icon={MessageCircle} />
        <StatCard label="图库" value={publicGalleries.length} tone="mint" icon={Image} />
        <StatCard label="照片" value={publicGalleries.reduce((sum, item) => sum + item.images.length, 0)} tone="rose" icon={Image} />
      </section>

      <section className="dashboard-grid">
        <div className="panel panel-large">
          <div className="section-title">
            <h2>最近文章</h2>
            <Link to="/articles">全部文章 <ArrowRight size={16} /></Link>
          </div>
          <div className="article-list compact">
            {publicArticles.length ? publicArticles.slice(0, 3).map((article) => (
              <Link className="article-row" key={article.id} to={`/articles/${article.id}`}>
                <img src={article.cover} alt={article.title} />
                <div>
                  <span>{formatShortDate(article.createdAt)} · {article.readMinutes} 分钟</span>
                  <h3>{article.title}</h3>
                  <p>{articleIntro(article.body)}</p>
                  <div className="pill-row">
                    <TagPill item={categoryById(categories, article.categoryId)} />
                  </div>
                </div>
              </Link>
            )) : <div className="empty-state"><strong>No articles</strong></div>}
          </div>
        </div>

        <div className="panel">
          <div className="section-title">
            <h2>碎碎念</h2>
            <Link to="/moments">更多 <ArrowRight size={16} /></Link>
          </div>
          <div className="thought-mini-list">
            {publicThoughts.length ? publicThoughts.slice(0, 3).map((thought) => (
              <article key={thought.id} className="thought-mini">
                <p>{thought.content}</p>
                <span>{formatShortDate(thought.createdAt)}</span>
              </article>
            )) : <div className="empty-state"><strong>No moments</strong></div>}
          </div>
        </div>

        {recentGallery ? (
          <Link className="image-feature panel" to={`/gallery/${recentGallery.id}`}>
            <img src={recentGallery.cover} alt={recentGallery.name} />
            <div>
              <span>图片事件</span>
              <h2>{recentGallery.name}</h2>
              <p>{recentGallery.description}</p>
            </div>
          </Link>
        ) : <div className="empty-state"><strong>No albums</strong></div>}
      </section>
    </div>
  );
}
