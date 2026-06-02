import { FormEvent, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useLife } from "../context/LifeContext";
import { Note } from "../types";
import { formatShortDate } from "../utils/format";

const colorOptions: Note["color"][] = ["sun", "mint", "sky", "rose"];

export function NotesPage() {
  const { notes, setNotes } = useLife();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<Note["color"]>("sun");

  function addNote(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() && !content.trim()) return;
    setNotes((current) => [
      {
        id: `note-${Date.now()}`,
        title: title.trim() || "未命名便签",
        content: content.trim(),
        color,
        createdAt: new Date().toISOString()
      },
      ...current
    ]);
    setTitle("");
    setContent("");
    setColor("sun");
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Quick Notes"
        title="便签"
        description="快速记录临时想法，像贴在桌边的小纸条。"
      />

      <form className="note-form" onSubmit={addNote}>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="便签标题" />
        <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={3} placeholder="随手记一点什么" />
        <div className="composer-actions">
          <div className="color-picker">
            {colorOptions.map((option) => (
              <button
                aria-label={`选择 ${option}`}
                className={color === option ? `note-dot note-${option} active` : `note-dot note-${option}`}
                key={option}
                onClick={() => setColor(option)}
                type="button"
              />
            ))}
          </div>
          <button className="primary-button" type="submit">添加便签</button>
        </div>
      </form>

      <section className="note-grid">
        {notes.map((note) => (
          <article className={`note-card note-${note.color}`} key={note.id}>
            <span>{formatShortDate(note.createdAt)}</span>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
            <button type="button" onClick={() => setNotes((current) => current.filter((item) => item.id !== note.id))}>
              删除
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
