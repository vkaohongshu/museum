import { FileText, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { MarkdownView } from "../../components/MarkdownView";
import { TagPill } from "../../components/TagPill";
import { useLife } from "../../context/LifeContext";
import { articleIntro, formatShortDate } from "../../utils/format";
import { categoryById, tagsByIds } from "../../utils/taxonomy";

export function StudioArticlesPage() {
  const { articles, categories, tags } = useLife();
  const [activeId, setActiveId] = useState(articles[0]?.id ?? "");
  const active = articles.find((article) => article.id === activeId) ?? articles[0];

  return (
    <div className="studio-article-workbench">
      <aside className="article-notion-list panel">
        <div className="section-title">
          <h2><FileText size={18} /> 文章工作台</h2>
          <Link className="primary-button" to="/admin/articles/new"><Plus size={17} />新建</Link>
        </div>
        <div className="notion-page-list">
          {articles.map((article) => (
            <button className={active?.id === article.id ? "notion-page active" : "notion-page"} key={article.id} onClick={() => setActiveId(article.id)} type="button">
              <strong>{article.title}</strong>
              <span>{formatShortDate(article.createdAt)}</span>
              <p>{articleIntro(article.body)}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="article-preview panel">
        {active ? (
          <>
            {active.cover ? <img src={active.cover} alt={active.title} /> : (
              <div className="article-text-cover article-preview-text-cover">
                <span>{formatShortDate(active.createdAt)}</span>
                <strong>{active.title}</strong>
              </div>
            )}
            <div className="pill-row">
              <TagPill item={categoryById(categories, active.categoryId)} />
              {tagsByIds(tags, active.tagIds).map((tag) => <TagPill key={tag.id} item={tag} subtle />)}
            </div>
            <h1>{active.title}</h1>
            <p className="lead">{articleIntro(active.body)}</p>
            <Link className="primary-button" to={`/admin/articles/${active.id}`}>进入写作页</Link>
            <MarkdownView content={active.body} />
          </>
        ) : <div className="empty-state"><strong>还没有文章</strong><p>从左侧新建第一篇生活记录。</p></div>}
      </section>
    </div>
  );
}
