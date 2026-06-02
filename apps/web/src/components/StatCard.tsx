import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  tone,
  icon: Icon
}: {
  label: string;
  value: number | string;
  tone: "sun" | "sky" | "mint" | "rose";
  icon: LucideIcon;
}) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="stat-icon">
        <Icon size={22} />
      </div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  );
}
