import { FileText, Image, MapPin, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLife } from "../context/LifeContext";

export function RelatedContentList({
  articleIds = [],
  thoughtIds = [],
  galleryIds = [],
  locationIds = []
}: {
  articleIds?: string[];
  thoughtIds?: string[];
  galleryIds?: string[];
  locationIds?: string[];
}) {
  const { articles, thoughts, galleryEvents, locations } = useLife();
  const items = [
    ...articleIds
      .map((id) => articles.find((item) => item.id === id))
      .filter(Boolean)
      .map((item) => ({ icon: FileText, label: "文章", title: item!.title, to: `/articles/${item!.id}` })),
    ...thoughtIds
      .map((id) => thoughts.find((item) => item.id === id))
      .filter(Boolean)
      .map((item) => ({ icon: MessageCircle, label: "碎碎念", title: item!.content.slice(0, 34), to: "/moments" })),
    ...galleryIds
      .map((id) => galleryEvents.find((item) => item.id === id))
      .filter(Boolean)
      .map((item) => ({ icon: Image, label: "图库", title: item!.name, to: `/gallery/${item!.id}` })),
    ...locationIds
      .map((id) => locations.find((item) => item.id === id))
      .filter(Boolean)
      .map((item) => ({ icon: MapPin, label: "地点", title: item!.name, to: `/admin/locations` }))
  ];

  if (!items.length) return null;

  return (
    <section className="panel related-panel">
      <div className="section-title">
        <h2>相关内容</h2>
      </div>
      <div className="related-list">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link to={item.to} key={`${item.label}-${item.title}-${index}`}>
              <Icon size={18} />
              <span>{item.label}</span>
              <strong>{item.title}</strong>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
