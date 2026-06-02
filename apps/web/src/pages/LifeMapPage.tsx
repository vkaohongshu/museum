import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { RelatedContentList } from "../components/RelatedContentList";
import { useLife } from "../context/LifeContext";

export function LifeMapPage() {
  const { locations } = useLife();
  const [activeId, setActiveId] = useState(locations[0]?.id ?? "");
  const active = useMemo(() => locations.find((item) => item.id === activeId) ?? locations[0], [activeId, locations]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Life Map"
        title="人生地图"
        description="暂时用明亮的伪地图和地点卡片墙呈现，数据结构已预留经纬度，后续可接入高德、Mapbox 或 Leaflet。"
      />

      <section className="life-map-layout">
        <div className="mock-map panel">
          <div className="map-grid-bg" />
          {locations.map((location, index) => (
            <button
              className={active?.id === location.id ? "map-pin active" : "map-pin"}
              key={location.id}
              onClick={() => setActiveId(location.id)}
              style={{ left: `${22 + index * 23}%`, top: `${28 + (index % 2) * 28}%` }}
              type="button"
            >
              <MapPin size={18} />
              {location.city}
            </button>
          ))}
        </div>

        <aside className="panel location-detail">
          {active ? (
            <>
              <img src={active.coverImage} alt={active.name} />
              <span>{active.city}, {active.country}</span>
              <h2>{active.name}</h2>
              <p>{active.description}</p>
              <small>坐标：{active.latitude}, {active.longitude}</small>
              <RelatedContentList
                articleIds={active.relatedArticleIds}
                thoughtIds={active.relatedMomentIds}
                galleryIds={active.relatedGalleryIds}
              />
            </>
          ) : null}
        </aside>
      </section>

      <section className="location-grid">
        {locations.map((location) => (
          <button className="location-card" key={location.id} onClick={() => setActiveId(location.id)} type="button">
            <img src={location.coverImage} alt={location.name} />
            <div>
              <span>{location.city} · {location.country}</span>
              <h2>{location.name}</h2>
              <p>{location.relatedArticleIds.length + location.relatedMomentIds.length + location.relatedGalleryIds.length} 条相关记录</p>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}
