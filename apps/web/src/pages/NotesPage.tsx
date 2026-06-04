import { FormEvent, useState } from "react";
import { X } from "lucide-react";
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
  const [editingId, setEditingId] = useState("");
  const editingNote = notes.find((note) => note.id === editingId);

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

  function updateEditingNote(patch: Partial<Note>) {
    if (!editingNote) return;
    setNotes((current) => current.map((note) => note.id === editingNote.id ? { ...note, ...patch, updatedAt: new Date().toISOString() } : note));
  }

  function deleteEditingNote() {
    if (!editingNote) return;
    setNotes((current) => current.filter((note) => note.id !== editingNote.id));
    setEditingId("");
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
          <button className={`note-card note-${note.color}`} key={note.id} onClick={() => setEditingId(note.id)} type="button">
            <span>{formatShortDate(note.createdAt)}</span>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
          </button>
        ))}
      </section>

      {editingNote ? (
        <div className="drawer-backdrop note-drawer-backdrop" onClick={() => setEditingId("")}>
          <aside className="edit-drawer note-edit-drawer" onClick={(event) => event.stopPropagation()}>
            <button aria-label="关闭" className="memory-drawer-close" onClick={() => setEditingId("")} type="button"><X size={18} /></button>
            <span className="eyebrow">Note</span>
            <label>
              标题
              <input value={editingNote.title} onChange={(event) => updateEditingNote({ title: event.target.value })} />
            </label>
            <label>
              内容
              <textarea rows={8} value={editingNote.content} onChange={(event) => updateEditingNote({ content: event.target.value })} />
            </label>
            <label>
              颜色
              <div className="color-picker drawer-color-picker">
                {colorOptions.map((option) => (
                  <button
                    aria-label={`选择 ${option}`}
                    className={editingNote.color === option ? `note-dot note-${option} active` : `note-dot note-${option}`}
                    key={option}
                    onClick={() => updateEditingNote({ color: option })}
                    type="button"
                  />
                ))}
              </div>
            </label>
            <div className="button-row">
              <button className="primary-button" onClick={() => setEditingId("")} type="button">保存</button>
              <button className="secondary-button" onClick={deleteEditingNote} type="button">删除</button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
