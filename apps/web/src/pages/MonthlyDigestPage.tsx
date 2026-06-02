import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Image, MessageCircle, Smile, FileText } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { useLife } from "../context/LifeContext";
import { formatDate, sameMonth } from "../utils/format";
import { imageCount, keywordsFromTags, moodSummary } from "../utils/insights";

export function MonthlyDigestPage() {
  const { articles, thoughts, galleryEvents, moodEntries, tags } = useLife();
  const [month, setMonth] = useState("2026-05");
  const monthArticles = articles.filter((item) => sameMonth(item.createdAt, month));
  const monthThoughts = thoughts.filter((item) => sameMonth(item.createdAt, month));
  const monthGalleries = galleryEvents.filter((item) => sameMonth(item.date, month));
  const monthMoods = moodEntries.filter((item) => sameMonth(item.date, month));
  const photos = monthGalleries.flatMap((item) => item.images).slice(0, 8);
  const keywords = useMemo(
    () => keywordsFromTags(tags, [...monthArticles.flatMap((item) => item.tagIds), ...monthThoughts.flatMap((item) => item.tagIds), ...monthGalleries.flatMap((item) => item.tagIds)], ["月度", "生活", "小报"]),
    [tags, monthArticles, monthThoughts, monthGalleries]
  );
  const moodCounts = moodSummary(monthMoods);
  const records = [
    ...monthArticles.map((item) => ({ title: item.title, date: item.createdAt, path: `/articles/${item.id}`, type: "文章" })),
    ...monthThoughts.map((item) => ({ title: item.content, date: item.createdAt, path: "/thoughts", type: "碎碎念" })),
    ...monthGalleries.map((item) => ({ title: item.name, date: item.date, path: `/gallery/${item.id}`, type: "图库" }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Monthly Digest"
        title="月度小报"
        description="像一页轻量生活杂志，自动整理本月文字、照片、关键词和心情。"
        action={<input className="compact-input" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />}
      />

      <section className="digest-cover panel">
        <span>{month} Life Magazine</span>
        <h2>本月生活小报已生成</h2>
        <p>这一页先基于 mock/localStorage 数据生成静态结果，未来可以接 AI 总结。</p>
        <button className="primary-button" type="button">生成小报</button>
      </section>

      <section className="stats-grid">
        <StatCard label="文章" value={monthArticles.length} tone="sun" icon={FileText} />
        <StatCard label="碎碎念" value={monthThoughts.length} tone="sky" icon={MessageCircle} />
        <StatCard label="图片" value={imageCount(monthGalleries)} tone="mint" icon={Image} />
        <StatCard label="心情记录" value={monthMoods.length} tone="rose" icon={Smile} />
      </section>

      <section className="two-column">
        <div className="panel">
          <div className="section-title"><h2>本月照片墙</h2></div>
          <div className="digest-photo-wall">{photos.map((photo) => <img src={photo} alt="本月照片" key={photo} />)}</div>
        </div>
        <div className="panel">
          <div className="section-title"><h2>关键词与心情</h2></div>
          <div className="keyword-cloud">{keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div>
          <div className="mood-bars">
            {Object.entries(moodCounts).map(([mood, count]) => (
              <div key={mood}><span>{mood}</span><strong style={{ width: `${Number(count) * 36}px` }} /> <small>{Number(count)} 天</small></div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-title"><h2>本月重要记录</h2></div>
        <div className="moment-list">
          {records.map((record) => (
            <Link to={record.path} key={`${record.type}-${record.date}`}>
              <span>{record.type}</span>
              <div>
                <strong>{record.title}</strong>
                <p>{formatDate(record.date)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
