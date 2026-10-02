"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import type { FeedItem } from "@/lib/types/feed";
import { getFeedHeadline } from "@/lib/utils";
import {
  mapCenterAtom,
  selectedFeedAtom,
  isModalOpenAtom,
  securitySubCategoryAtom,
  languageAtom,
} from "@/lib/store";

function createCategoryIcon(category: string, verified: boolean) {
  const color = category === "WAR" ? "#ef4444" : "#f59e0b";
  const borderColor = verified ? "#22c55e" : "#6b7280";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="${color}" stroke="${borderColor}" stroke-width="2"/>
      <circle cx="16" cy="16" r="8" fill="white" opacity="0.9"/>
      ${
        category === "WAR"
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

function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function FitBoundsUpdater({ feeds }: { feeds: FeedItem[] }) {
  const map = useMap();
  useEffect(() => {
    if (feeds.length === 0) return;
    const bounds = L.latLngBounds(
      feeds.map((f) => [f.location.lat, f.location.lng] as L.LatLngTuple)
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
  }, [feeds, map]);
  return null;
}

interface SecurityMapClientProps {
  feeds: FeedItem[];
}

export function SecurityMapClient({ feeds: allFeeds }: SecurityMapClientProps) {
  // Articles without coordinates stay in the list but can't be placed on the map.
  // Memoized: FitBoundsUpdater refits whenever this array identity changes.
  const feeds = useMemo(
    () => allFeeds.filter((f) => f.location?.lat != null && f.location?.lng != null),
    [allFeeds]
  );
  const [center] = useAtom(mapCenterAtom);
  const subCategory = useAtomValue(securitySubCategoryAtom);
  const lang = useAtomValue(languageAtom);
  const setSelectedFeed = useSetAtom(selectedFeedAtom);
  const setIsModalOpen = useSetAtom(isModalOpenAtom);
  const isShowAll = subCategory === "";
  const defaultPosition: LatLngExpression = center || [37.5665, 126.978];

  return (
    <MapContainer
      center={defaultPosition}
      zoom={4}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom={true}
    >
      {isShowAll && feeds.length > 0 ? (
        <FitBoundsUpdater feeds={feeds} />
      ) : (
        center && <MapCenterUpdater center={center} />
      )}
      {/* CARTO basemaps now require an API key; Esri Dark Gray is keyless */}
      <TileLayer
        attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        maxZoom={16}
      />

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
              <h3 className="font-semibold text-sm mb-1">{getFeedHeadline(feed, lang)}</h3>
              <p className="text-xs text-gray-600 mb-1">{feed.location.name}</p>
              <p className="text-xs text-gray-500">
                {new Date(feed.publishedAt).toLocaleDateString("en-US")}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
