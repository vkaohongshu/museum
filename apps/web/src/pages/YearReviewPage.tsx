import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Image, MessageCircle, Sparkles } from "lucide-react";
import { MemoryJar } from "../components/memory/MemoryJar";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { useLife } from "../context/LifeContext";
import { formatDate, sameYear } from "../utils/format";
import { imageCount, memoryItemsFromTagIds, topEntry } from "../utils/insights";

export function YearReviewPage() {
  const { articles, thoughts, galleryEvents, capsules, moodEntries, tags } = useLife();
  const [year, setYear] = useState(2026);
  const yearArticles = articles.filter((item) => sameYear(item.createdAt, year));
  const yearThoughts = thoughts.filter((item) => sameYear(item.createdAt, year));
  const yearGalleries = galleryEvents.filter((item) => sameYear(item.date, year));
  const yearCapsules = capsules.filter((item) => sameYear(item.date, year));
  const yearMoods = moodEntries.filter((item) => sameYear(item.date, year));
  const yearTagIds = [...yearArticles.flatMap((item) => item.tagIds), ...yearThoughts.flatMap((item) => item.tagIds), ...yearGalleries.flatMap((item) => item.tagIds)];
  const memoryItems = useMemo(
    () => memoryItemsFromTagIds(tags, yearTagIds, ["旅行", "学习", "摄影", "健身", "阅读", "生活", "音乐", "美食"], 15),
    [tags, yearTagIds]
  );
  const moments = [
    ...yearArticles.map((item) => ({ title: item.title, date: item.createdAt, path: `/articles/${item.id}`, type: "文章" })),
    ...yearThoughts.map((item) => ({ title: item.content, date: item.createdAt, path: "/thoughts", type: "碎碎念" })),
    ...yearGalleries.map((item) => ({ title: item.name, date: item.date, path: `/gallery/${item.id}`, type: "图库" })),
    ...yearCapsules.map((item) => ({ title: item.title, date: item.date, path: "/capsules", type: "记忆" }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  const photos = yearGalleries.flatMap((event) => event.images).slice(0, 9);
  const topKeywords = memoryItems.slice(0, 5).map((item) => item.name).join("、");

  return (
    <div className="page-stack">
      <PageHeader
        action={<input className="compact-input" type="number" value={year} onChange={(event) => setYear(Number(event.target.value))} />}
        description="像一份私人年度报告，轻轻盘点这一年的文字、照片、地点与心情。"
        eyebrow="Year Review"
        title={`${year} 年度回顾`}
      />

      <section className="review-hero panel">
        <span><Sparkles size={20} /> Annual Life Report</span>
        <h2>这一年，你保存了 {moments.length} 个重要瞬间</h2>
        <p>最常见心情是 <strong>{topEntry(yearMoods.map((entry) => entry.mood))}</strong>，今年最重要的主题包括 {topKeywords || "生活、照片、回忆"}。</p>
      </section>

      <section className="stats-grid">
        <StatCard label="文章" value={yearArticles.length} tone="sun" icon={FileText} />
        <StatCard label="碎碎念" value={yearThoughts.length} tone="sky" icon={MessageCircle} />
        <StatCard label="图库事件" value={yearGalleries.length} tone="mint" icon={Image} />
        <StatCard label="图片" value={imageCount(yearGalleries)} tone="rose" icon={Image} />
      </section>

      <section className="two-column review-memory-section">
        <div className="panel memory-keyword-panel">
          <MemoryJar
            emptyText="今年还没有被收藏进瓶子的主题"
            items={memoryItems}
            size="compact"
            subtitle="今年最重要的主题，会像收藏物一样沉在年度记忆瓶里。"
            title="年度记忆关键词"
          />
        </div>
        <div className="panel">
          <div className="section-title"><h2>年度十大瞬间</h2></div>
          <div className="moment-list">
            {moments.map((moment, index) => (
              <Link to={moment.path} key={`${moment.type}-${moment.date}`}>
                <span>{index + 1}</span>
                <div>
                  <strong>{moment.title}</strong>
                  <p>{moment.type} · {formatDate(moment.date)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-title"><h2>年度照片墙</h2></div>
        <div className="digest-photo-wall">
          {photos.map((photo) => <img src={photo} alt="年度照片" key={photo} />)}
        </div>
      </section>
    </div>
  );
}
