import { CSSProperties } from "react";
import { Category, Tag } from "../types";

export function TagPill({ item, subtle = false }: { item?: Tag | Category; subtle?: boolean }) {
  if (!item) return null;

  return (
    <span
      className={subtle ? "pill pill-subtle" : "pill"}
      style={{
        "--pill-color": item.color
      } as CSSProperties}
    >
      {item.name}
    </span>
  );
}
