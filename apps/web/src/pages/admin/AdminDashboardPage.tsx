import { FileText, Image, Lightbulb, MessageCircle, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useLife } from "../../context/LifeContext";
import { formatShortDate } from "../../utils/format";

export function AdminDashboardPage() {
  const { settings, articles, thoughts, galleryEvents, inspirations } = useLife();

  return (
    <div className="page-stack studio-home">
      <header className="studio-hero panel">
        <span>Creator Studio · {settings.authorNickname}</span>
        <h1>{settings.homeWelcome}</h1>
        <p>{settings.siteDescription}</p>
        <div className="studio-actions">
          <Link className="primary-button" to="/admin/articles/new"><Plus size={18} />写文章</Link>
          <Link className="secondary-button" to="/admin/moments">发碎碎念</Link>
          <Link className="secondary-button" to="/admin/gallery">创建相册</Link>
          <Link className="secondary-button" to="/admin/inspirations">添加灵感</Link>
        </div>
      </header>

      <section className="studio-widget-grid">
        <article className="studio-widget">
          <div className="section-title"><h2><FileText size={18} /> 最近文章</h2><Link to="/admin/articles">进入</Link></div>
          {articles.slice(0, 4).map((article) => <Link to={`/admin/articles/${article.id}`} key={article.id}>{article.title}<span>{formatShortDate(article.createdAt)}</span></Link>)}
        </article>
        <article className="studio-widget">
          <div className="section-title"><h2><MessageCircle size={18} /> 最近碎碎念</h2><Link to="/admin/moments">进入</Link></div>
          {thoughts.slice(0, 4).map((thought) => <Link to="/admin/moments" key={thought.id}>{thought.content.slice(0, 34)}<span>{formatShortDate(thought.createdAt)}</span></Link>)}
        </article>
        <article className="studio-widget">
          <div className="section-title"><h2><Image size={18} /> 最近相册</h2><Link to="/admin/gallery">进入</Link></div>
          {galleryEvents.slice(0, 4).map((album) => <Link to={`/admin/gallery/${album.id}`} key={album.id}>{album.name}<span>{album.images.length} 张图片</span></Link>)}
        </article>
        <article className="studio-widget">
          <div className="section-title"><h2><Lightbulb size={18} /> 最近灵感</h2><Link to="/admin/inspirations">进入</Link></div>
          {inspirations.slice(0, 4).map((idea) => <Link to="/admin/inspirations" key={idea.id}>{idea.title}<span>{idea.type} · {idea.status}</span></Link>)}
        </article>
      </section>
    </div>
  );
}
