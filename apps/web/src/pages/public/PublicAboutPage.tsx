import { PageHeader } from "../../components/PageHeader";

export function PublicAboutPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="About"
        title="关于这个生活记录馆"
        description="这是人生记录馆的前台页面，适合挂到网上给朋友或读者浏览。"
      />
      <section className="panel about-panel">
        <h2>轻松、阳光、有生活气</h2>
        <p>
          前台呈现文章、碎碎念、图库、月度小报、年度回顾和时间线。所有记录、创作、整理照片、备份和系统设置都集中在 Studio，
          普通访问者不会看到创作入口，也无法修改内容。
        </p>
        <p className="muted-text">Studio 的本地入口只是 MVP 保护；真实上线时仍需要服务端认证与权限控制。</p>
      </section>
    </div>
  );
}
