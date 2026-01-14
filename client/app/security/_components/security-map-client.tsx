"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAtom, useSetAtom } from "jotai";

import type { FeedItem } from "@/lib/types/feed";
import { mapCenterAtom, selectedFeedAtom, isModalOpenAtom } from "@/lib/store";

// leaflet 기본 마커 아이콘 경로 설정
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// 아이콘 경로를 명시적으로 지정
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

// 지도 중심 변경을 위한 컴포넌트
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

interface SecurityMapClientProps {
  feeds: FeedItem[];
}

export function SecurityMapClient({ feeds }: SecurityMapClientProps) {
  const [center] = useAtom(mapCenterAtom);
  const setSelectedFeed = useSetAtom(selectedFeedAtom);
  const setIsModalOpen = useSetAtom(isModalOpenAtom);
  const defaultPosition: LatLngExpression = center || [37.5665, 126.978];

  return (
    <MapContainer
      center={defaultPosition}
      zoom={4}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom={true}
    >
      {center && <MapCenterUpdater center={center} />}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 피드 데이터의 위치에 마커 추가 */}
      {feeds.map((feed) => (
        <Marker
          key={feed.id}
          position={[feed.location.lat, feed.location.lng]}
          eventHandlers={{
            click: () => {
              setSelectedFeed(feed);
              setIsModalOpen(true);
            },
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-sm mb-1">{feed.title}</h3>
              <p className="text-xs text-gray-600 mb-1">{feed.location.name}</p>
              <p className="text-xs text-gray-500">{feed.publishedAt.toLocaleDateString()}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
