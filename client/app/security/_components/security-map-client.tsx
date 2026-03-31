"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAtom, useSetAtom } from "jotai";

import type { FeedItem } from "@/lib/types/feed";
import { mapCenterAtom, selectedFeedAtom, isModalOpenAtom } from "@/lib/store";

// 카테고리별 SVG 마커 아이콘
function createCategoryIcon(category: string, verified: boolean) {
  const color = category === "WAR" ? "#ef4444" : "#f59e0b"; // red for war, amber for security
  const borderColor = verified ? "#22c55e" : "#6b7280"; // green if verified, gray otherwise
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="${color}" stroke="${borderColor}" stroke-width="2"/>
      <circle cx="16" cy="16" r="8" fill="white" opacity="0.9"/>
      ${category === "WAR"
        ? '<path d="M12 12l8 8M20 12l-8 8" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>'
        : '<path d="M16 10v6m0 4v.01" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>'
      }
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}

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
          icon={createCategoryIcon(feed.category, feed.verificationStatus === "verified")}
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
              <p className="text-xs text-gray-500">{new Date(feed.publishedAt).toLocaleDateString()}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
