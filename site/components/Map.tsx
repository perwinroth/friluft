"use client";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

type Props = { query?: string; cats?: string[] };

export default function Map({ query = '', cats = [] }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<any>(null);

  useEffect(()=>{
    if (!mapRef.current || leafletRef.current) return;
    const map = L.map(mapRef.current).setView([62.0, 15.0], 5);
    leafletRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    // @ts-ignore
    const cluster = (L as any).markerClusterGroup ? (L as any).markerClusterGroup({
      disableClusteringAtZoom:14, showCoverageOnHover:false, spiderfyOnMaxZoom:true, maxClusterRadius:50
    }) : L.layerGroup();
    clusterRef.current = cluster;
    map.addLayer(cluster);
  },[]);

  useEffect(()=>{
    const map = leafletRef.current; const cluster = clusterRef.current; if (!map || !cluster) return;
    // Clear
    // @ts-ignore
    if (cluster.clearLayers) cluster.clearLayers();
    fetch('/data/friluft.geojson')
      .then(r=>r.json())
      .then(geo=>{
        (geo.features||[]).forEach((f:any)=>{
          const [lon, lat] = f.geometry.coordinates;
          const p = f.properties||{};
          const name = p.name || '(namnlös)';
          const link = p.link || p.osm_url;
          const categories = p.categories || [];
          // filter
          const qok = !query || String(name).toLowerCase().includes(query.toLowerCase());
          const cok = !cats.length || categories.some((c:string)=> cats.includes(c));
          if (!qok || !cok) return;
          const marker = L.marker([lat, lon]);
          marker.bindPopup(`<strong>${name}</strong><br/><a href="${link}" target="_blank" rel="noopener">Länk</a>`);
          // @ts-ignore
          if (cluster.addLayer) cluster.addLayer(marker); else marker.addTo(cluster);
        });
      })
  },[query, cats.join(',')]);

  return <div ref={mapRef} style={{height: '70vh', width: '100%'}} />
}

