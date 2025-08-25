"use client";
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

const LeafletMap = dynamic(()=> import('../../components/Map'), { ssr: false });

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [cats, setCats] = useState<Record<string, boolean>>({
    national_park:true, nature_reserve:true, camp_site:true, shelter:true,
    viewpoint:true, picnic_site:true, slipway:true, canoe_kayak:true, boat_rental:true
  });

  const activeCats = useMemo(()=> Object.keys(cats).filter(k=>cats[k]), [cats]);

  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) setQuery(q);
  },[]);

  return (
    <div className="container">
      <div className="pill" style={{position:'sticky', top:8, zIndex:10}}>
        <span>🔍</span>
        <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Sök plats eller aktivitet" />
      </div>
      <div style={{display:'flex', gap:8, flexWrap:'wrap', margin:'8px 0 12px'}}>
        {Object.keys(cats).map(k=> (
          <button key={k} className="pill" onClick={()=> setCats(s=>({...s,[k]:!s[k]}))} style={{background: cats[k]?'#fff':'#f5f5f5'}}>{k}</button>
        ))}
      </div>
      <div className="card">
        <LeafletMap query={query} cats={activeCats} />
      </div>
    </div>
  )
}

