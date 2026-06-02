import { useState } from "react";
import { useLife } from "../../context/LifeContext";
import { MoodName, WeatherName } from "../../types";
import { dateKey } from "../../utils/format";

const moods: MoodName[] = ["开心", "平静", "疲惫", "焦虑", "兴奋", "低落"];
const weathers: WeatherName[] = ["晴天", "多云", "下雨", "下雪", "阴天"];
const moodEmoji: Record<MoodName, string> = { 开心: "😊", 平静: "🌿", 疲惫: "😮‍💨", 焦虑: "🌧", 兴奋: "✨", 低落: "☁️" };

function monthDays(month: string) {
  const date = new Date(`${month}-01T00:00:00`);
  const total = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Array.from({ length: total }, (_, index) => new Date(date.getFullYear(), date.getMonth(), index + 1));
}

export function StudioMoodCalendarPage() {
  const { moodEntries, setMoodEntries } = useLife();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selected, setSelected] = useState(`${month}-01`);
  const entry = moodEntries.find((item) => dateKey(item.date) === selected);

  function savePatch(patch: Partial<NonNullable<typeof entry>>) {
    const now = new Date().toISOString();
    setMoodEntries((current) => {
      const found = current.find((item) => dateKey(item.date) === selected);
      if (found) return current.map((item) => item.id === found.id ? { ...item, ...patch, updatedAt: now } : item);
      return [{
        id: `mood-${Date.now()}`,
        date: `${selected}T08:00:00.000Z`,
        mood: "平静",
        weather: "晴天",
        note: "",
        relatedArticleIds: [],
        relatedMomentIds: [],
        relatedGalleryIds: [],
        createdAt: now,
        updatedAt: now,
        ...patch
      }, ...current];
    });
  }

  return (
    <div className="page-stack">
      <header className="studio-section-hero panel">
        <span>Mood Studio</span>
        <h1>心情日历</h1>
        <p>点击日期直接编辑当天心情、天气和一句话状态，不需要列表 CRUD。</p>
        <input className="compact-input" type="month" value={month} onChange={(event) => { setMonth(event.target.value); setSelected(`${event.target.value}-01`); }} />
      </header>
      <section className="calendar-layout">
        <div className="calendar-card">
          <div className="mood-calendar-grid">
            {monthDays(month).map((day) => {
              const key = dateKey(day.toISOString());
              const dayEntry = moodEntries.find((item) => dateKey(item.date) === key);
              return <button className={selected === key ? "mood-day active" : "mood-day"} key={key} type="button" onClick={() => setSelected(key)}><strong>{day.getDate()}</strong><span>{dayEntry ? moodEmoji[dayEntry.mood] : "＋"}</span></button>;
            })}
          </div>
        </div>
        <aside className="panel mood-editor-card">
          <h2>{selected}</h2>
          <label>心情<select value={entry?.mood ?? "平静"} onChange={(event) => savePatch({ mood: event.target.value as MoodName })}>{moods.map((mood) => <option key={mood}>{mood}</option>)}</select></label>
          <label>天气<select value={entry?.weather ?? "晴天"} onChange={(event) => savePatch({ weather: event.target.value as WeatherName })}>{weathers.map((weather) => <option key={weather}>{weather}</option>)}</select></label>
          <label>一句话<textarea rows={4} value={entry?.note ?? ""} onChange={(event) => savePatch({ note: event.target.value })} placeholder="今天的生活状态" /></label>
        </aside>
      </section>
    </div>
  );
}
