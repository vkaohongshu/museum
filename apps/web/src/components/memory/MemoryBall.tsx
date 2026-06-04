import { CSSProperties } from "react";

export interface MemoryJarItem {
  id: string;
  name: string;
  count: number;
  color: string;
  icon: string;
}

interface MemoryBallProps {
  item: MemoryJarItem;
  index: number;
  x: number;
  y: number;
  size: number;
  onClick?: (item: MemoryJarItem) => void;
}

export function MemoryBall({ item, index, x, y, size, onClick }: MemoryBallProps) {
  const style = {
    "--memory-ball-x": `${x}%`,
    "--memory-ball-y": `${y}%`,
    "--memory-ball-size": `${size}px`,
    "--memory-ball-color": item.color,
    "--memory-ball-delay": `${(index % 5) * 0.22}s`
  } as CSSProperties;
  const label = `${item.name}，${item.count} 条关联内容`;

  return (
    <button
      aria-label={label}
      className="memory-ball"
      onClick={() => onClick?.(item)}
      style={style}
      title={label}
      type="button"
    >
      <span className="memory-ball-shine" />
      <span className="memory-ball-icon">{item.icon}</span>
      <span className="memory-ball-name">{item.name}</span>
      <span className="memory-ball-popover">
        <strong>{item.name}</strong>
        <small>{item.count} 条关联内容</small>
      </span>
    </button>
  );
}
