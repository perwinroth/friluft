import fs from 'node:fs/promises'
import path from 'node:path'

type EventItem = { name: string; date?: string; location?: string; description?: string; registrationUrl?: string }

async function loadEvents(): Promise<EventItem[]> {
  const p = path.join(process.cwd(), '..', 'data', 'events.json')
  try {
    const buf = await fs.readFile(p, 'utf-8')
    const items = JSON.parse(buf)
    return (items as EventItem[]).sort((a,b)=> (a.date||'').localeCompare(b.date||''))
  } catch {
    return []
  }
}

export default async function EventsPage() {
  const events = await loadEvents()
  const jsonLd = {
    '@context':'https://schema.org', '@type':'ItemList',
    itemListElement: events.map(ev => ({
      '@type':'Event', name: ev.name, startDate: ev.date, description: ev.description, url: ev.registrationUrl,
      location: { '@type':'Place', name: ev.location, address: ev.location }
    }))
  }
  return (
    <div className="container">
      <head>
        <title>Friluft – Evenemang</title>
        <meta name="description" content="Kalender med lopp och evenemang inom friluftsliv i Sverige." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      </head>
      <h1>Evenemang</h1>
      <div className="card">
        <ul style={{listStyle:'none', padding:0}}>
          {events.map((ev, i)=> (
            <li key={i} style={{border:'1px solid #eee', borderRadius:10, padding:12, marginBottom:8}}>
              <strong>{ev.name}</strong><br/>
              <small>{ev.date} – {ev.location}</small><br/>
              {ev.registrationUrl ? <a className="pill" href={ev.registrationUrl} target="_blank" rel="noopener">Anmälan</a> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

