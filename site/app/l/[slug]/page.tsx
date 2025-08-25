import { notFound } from 'next/navigation'
import { loadPlaces, slugify } from '../../../lib/data'

export async function generateStaticParams() {
  const places = await loadPlaces();
  return places.slice(0, 500).map((p)=> ({ slug: slugify(String(p.id || p.name)) }));
}

export default async function ListingPage({ params }: { params: { slug: string } }) {
  const places = await loadPlaces();
  const match = places.find(p => slugify(String(p.id || p.name)) === params.slug);
  if (!match) return notFound();
  const title = `${match.name} – Friluft`;
  const desc = match.description || `Aktivitet: ${(match.categories||[]).join(', ')}`;
  const lat = match.lat; const lon = match.lon;
  const website = match.website;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': match.name,
    'description': desc,
    'brand': 'Friluft',
    'offers': {
      '@type': 'Offer',
      'availability': 'https://schema.org/InStock',
      'priceCurrency': 'SEK',
      'url': website || undefined
    }
  };
  return (
    <div className="container">
      <head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      </head>
      <p><a href="/search">← Till sök</a></p>
      <h1>{match.name}</h1>
      <div className="grid">
        <div className="card">
          <p>{desc}</p>
          <p><strong>Koordinater:</strong> {lat}, {lon}</p>
          {website ? <p><a className="pill" href={website} target="_blank" rel="noopener">Boka/mer info</a></p> : null}
        </div>
        <div className="card">
          <iframe title="Karta" width="100%" height="300" style={{border:0}} loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?marker=${lat}%2C${lon}&layer=mapnik`} />
        </div>
      </div>
    </div>
  );
}

