import { PageHeader } from "../../components/PageHeader";
import { useLife } from "../../context/LifeContext";
import { SiteSettings } from "../../types";

const themeCards: { value: SiteSettings["theme"]; name: string; desc: string; colors: string[] }[] = [
  { value: "sunny", name: "晴空黄", desc: "明亮轻快，像有阳光的周末早晨。", colors: ["#ffb84d", "#fff1c9", "#5aa9ff"] },
  { value: "forest", name: "森林绿", desc: "自然安静，适合长期写作和回看。", colors: ["#2f8f5b", "#e4f1da", "#c6a15b"] },
  { value: "ocean", name: "海洋蓝", desc: "清爽通透，像海边和蓝色玻璃杯。", colors: ["#168aad", "#d9f3ff", "#20c997"] },
  { value: "sakura", name: "樱花粉", desc: "柔和松弛，适合回忆、相册和心情。", colors: ["#ff7eb6", "#ffe5f1", "#a78bfa"] },
  { value: "coffee", name: "奶咖棕", desc: "温暖柔软，有咖啡店和纸张的气味。", colors: ["#b8793a", "#f7dfbf", "#7aa37a"] }
];

export function AdminSettingsPage() {
  const { settings, setSettings } = useLife();

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Studio Settings" title="工作室设置" description="设置人生记录馆的名称、欢迎语、作者和整体视觉气质。" />

      <section className="panel site-settings-card">
        <div className="field-row">
          <label>
            站点名称
            <input value={settings.siteName} onChange={(event) => setSettings((current) => ({ ...current, siteName: event.target.value }))} placeholder="Link 的人生记录馆" />
          </label>
          <label>
            作者昵称
            <input value={settings.authorNickname} onChange={(event) => setSettings((current) => ({ ...current, authorNickname: event.target.value }))} placeholder="Link" />
          </label>
        </div>
        <label>
          首页欢迎语
          <input value={settings.homeWelcome} onChange={(event) => setSettings((current) => ({ ...current, homeWelcome: event.target.value }))} placeholder="今天也要好好生活。" />
        </label>
        <label>
          站点描述
          <textarea rows={3} value={settings.siteDescription} onChange={(event) => setSettings((current) => ({ ...current, siteDescription: event.target.value }))} placeholder="记录生活、成长、旅行和那些值得被记住的小瞬间。" />
        </label>
      </section>

      <section className="theme-card-grid">
        {themeCards.map((theme) => (
          <button className={settings.theme === theme.value ? "theme-card active" : "theme-card"} key={theme.value} type="button" onClick={() => setSettings((current) => ({ ...current, theme: theme.value }))}>
            <div className="theme-card-colors">{theme.colors.map((color) => <span style={{ background: color }} key={color} />)}</div>
            <div className="theme-preview-mini" style={{ background: `linear-gradient(135deg, ${theme.colors[1]}, #fff)` }}>
              <span style={{ background: theme.colors[0] }} />
              <strong style={{ background: theme.colors[2] }} />
              <em style={{ background: theme.colors[1] }} />
            </div>
            <h2>{theme.name}</h2>
            <p>{theme.desc}</p>
            {settings.theme === theme.value ? <small>当前主题</small> : null}
          </button>
        ))}
      </section>
    </div>
  );
}
