import { ReactNode } from "react";
import { MemoryBall, MemoryJarItem } from "./MemoryBall";
import "./MemoryJar.css";

interface MemoryJarProps {
  items: MemoryJarItem[];
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  size?: "compact" | "large";
  className?: string;
  emptyText?: string;
  onBallClick?: (item: MemoryJarItem) => void;
}

const jarSlots = [
  { x: 21, y: 72 }, { x: 43, y: 75 }, { x: 66, y: 72 }, { x: 80, y: 62 },
  { x: 25, y: 56 }, { x: 52, y: 57 }, { x: 72, y: 47 }, { x: 37, y: 44 },
  { x: 59, y: 36 }, { x: 24, y: 33 }, { x: 76, y: 30 }, { x: 48, y: 24 },
  { x: 32, y: 20 }, { x: 64, y: 18 }, { x: 50, y: 12 }
];

function ballSize(count: number, compact: boolean) {
  const size = count > 50 ? 96 : count > 20 ? 78 : 62;
  return compact ? Math.round(size * 0.78) : size;
}

export function MemoryJar({ items, title, subtitle, action, size = "large", className = "", emptyText = "还没有装进瓶子的记忆", onBallClick }: MemoryJarProps) {
  const compact = size === "compact";
  const visibleItems = items.slice(0, compact ? 12 : 15);
  const orderedItems = [...visibleItems].sort((a, b) => b.count - a.count);

  return (
    <section className={`memory-jar-wrap memory-jar-${size} ${className}`}>
      {(title || subtitle || action) ? (
        <div className="memory-jar-heading">
          <div>
            {title ? <h2>{title}</h2> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {action ? <div className="memory-jar-action">{action}</div> : null}
        </div>
      ) : null}

      <div className="memory-jar-stage">
        <div className="memory-cork" />
        <div className="memory-jar-lip" />
        <div className="memory-jar-glass">
          <span className="memory-jar-glow" />
          <span className="memory-bubble bubble-one" />
          <span className="memory-bubble bubble-two" />
          <span className="memory-bubble bubble-three" />
          <span className="memory-bubble bubble-four" />
          <div className="memory-ball-layer">
            {orderedItems.length > 0 ? orderedItems.map((item, index) => {
              const slot = jarSlots[index % jarSlots.length];
              return (
                <MemoryBall
                  index={index}
                  item={item}
                  key={item.id}
                  onClick={onBallClick}
                  size={ballSize(item.count, compact)}
                  x={slot.x}
                  y={slot.y}
                />
              );
            }) : <p className="memory-jar-empty">{emptyText}</p>}
          </div>
        </div>
        <div className="memory-jar-shadow" />
      </div>
    </section>
  );
}

export type { MemoryJarItem };
