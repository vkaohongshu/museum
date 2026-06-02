import { ArrowLeft, Clock } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { MarkdownView } from "../../components/MarkdownView";
import { RelatedContentList } from "../../components/RelatedContentList";
import { TagPill } from "../../components/TagPill";
import { useLife } from "../../context/LifeContext";
import { articleIntro, formatDate } from "../../utils/format";
import { categoryById, tagsByIds } from "../../utils/taxonomy";

export function PublicArticleDetailPage() {
  const { id } = useParams();
  const { articles, galleryEvents, categories, tags } = useLife();
  const article = articles.find((item) => item.id === id);

  if (!article) {
    return <div className="empty-state"><strong>文章不可访问</strong><p>这篇文章不存在。</p></div>;
  }

  const relatedGalleryIds = galleryEvents.filter((event) => event.linkedArticleIds.includes(article.id)).map((event) => event.id);

  return (
    <article className="article-detail">
      <Link className="back-link" to="/articles"><ArrowLeft size={17} />返回文章</Link>
      <img className="detail-cover" src={article.cover} alt={article.title} />
      <div className="detail-card">
        <div className="pill-row">
          <TagPill item={categoryById(categories, article.categoryId)} />
          {tagsByIds(tags, article.tagIds).map((tag) => <TagPill key={tag.id} item={tag} subtle />)}
        </div>
        <h1>{article.title}</h1>
        <div className="detail-meta">
          <span>{formatDate(article.createdAt)}</span>
          <span><Clock size={16} />{article.readMinutes} 分钟阅读</span>
        </div>
        <p className="lead">{articleIntro(article.body)}</p>
        <MarkdownView content={article.body} />
      </div>
      <RelatedContentList galleryIds={relatedGalleryIds} />
    </article>
  );
}
