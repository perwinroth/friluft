"use client";
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Props = { query?: string; cats?: string[] }

export default function ResultsList({ query = '', cats = [] }: Props) {
  const [items, setItems] = useState<any[]>([])
  useEffect(()=>{
    fetch('/api/data?kind=geojson').then(r=>r.json()).then(geo=>{
      setItems((geo.features||[]).map((f:any)=> ({
        id: f.properties?.id,
        name: f.properties?.name,
        link: f.properties?.link || f.properties?.osm_url,
        cats: f.properties?.categories || [],
        bookable: !!f.properties?.bookable,
        lat: f.geometry?.coordinates?.[1],
        lon: f.geometry?.coordinates?.[0]
      })))
    })
  },[])

  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase()
    return items.filter(it =>
      (!cats.length || it.cats.some((c:string)=> cats.includes(c))) &&
      (!q || String(it.name||'').toLowerCase().includes(q))
    ).slice(0, 50)
  }, [items, query, cats.join(',')])

  return (
    <div>
      <div style={{color:'#666', margin:'8px 0'}}>{filtered.length} träffar</div>
      <ul style={{listStyle:'none', padding:0}}>
        {filtered.map(it => (
          <li key={it.id} style={{border:'1px solid #eee', borderRadius:10, padding:10, marginBottom:8}}>
            <div style={{fontWeight:600}}>
              <Link href={`/l/${slugify(it.id)}`}>{it.name}</Link>{' '}
              {it.bookable ? <span style={{display:'inline-block', background:'#0f766e', color:'#fff', borderRadius:999, padding:'2px 8px', fontSize:12}}>Boka</span> : null}
            </div>
            <div style={{color:'#666', fontSize:12}}>{it.cats.join(', ')}</div>
            {it.link ? <div><a href={it.link} target="_blank" rel="noopener">Länk</a></div> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

function slugify(s: string) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'plats';
}

