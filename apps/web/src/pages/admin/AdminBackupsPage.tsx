import { Bell, Download, FileArchive, FileText, Upload } from "lucide-react";
import { downloadBackup } from "../../api/admin/backups";
import { PageHeader } from "../../components/PageHeader";

export function AdminBackupsPage() {
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Data Lifeline" title="数据备份" description="个人生活记录平台最重要的是数据安全。备份入口集中在后台，不在前台暴露。" />
      <section className="panel lifeline-panel">
        <div className="lifeline-actions">
          <button className="primary-button" type="button" onClick={() => void downloadBackup("json")}><Download size={18} />导出 JSON</button>
          <button className="secondary-button" type="button" onClick={() => void downloadBackup("markdown")}><FileText size={18} />导出 Markdown</button>
          <button className="secondary-button" type="button" onClick={() => void downloadBackup("images-manifest")}><FileArchive size={18} />导出图片清单</button>
          <button className="secondary-button" type="button"><Upload size={18} />导入备份</button>
          <button className="secondary-button" type="button"><Bell size={18} />本地备份提醒</button>
        </div>
        <p className="todo-note">JSON、Markdown 和图片清单会从服务器导出；导入校验和本地提醒保留为后续扩展。</p>
      </section>
    </div>
  );
}
