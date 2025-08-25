import os
import json
from pathlib import Path
from typing import Dict, Any, List, Tuple

# Reuse OSM scraper internals
import sys
sys.path.append(str(Path(__file__).resolve().parents[1] / 'scraper'))
import overpass_scraper  # type: ignore

from .sources.hav_badplatser import fetch_hav_badplatser
from .sources.municipal_generic import fetch_municipal_dataset
from .util.enrich import enrich_places_opengraph
from .util.dedupe import dedupe_places
from .util.bookable import detect_booking_type

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / 'data'


def place_from_osm_feature(f: Dict[str, Any]) -> Dict[str, Any]:
    p = f.get('properties', {})
    [lon, lat] = f.get('geometry', {}).get('coordinates', [None, None])
    return {
        'id': p.get('id'),
        'name': p.get('name'),
        'categories': p.get('categories', []),
        'lat': lat,
        'lon': lon,
        'website': p.get('link') or p.get('osm_url'),
        'source': {'name': 'OSM', 'url': p.get('osm_url'), 'license': 'ODbL'},
        'amenities': [],
        'images': [],
        'opening_hours': None,
        'description': None,
    }


def run_osm(endpoint: str) -> List[Dict[str, Any]]:
    cats = list(overpass_scraper.CATEGORY_DEFS.keys())
    feats = overpass_scraper.scrape(endpoint, cats)
    # website-only already enforced by overpass_scraper.to_feature
    return [place_from_osm_feature(f) for f in feats]


def main() -> int:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    endpoint = os.environ.get('OVERPASS_ENDPOINT', overpass_scraper.DEFAULT_ENDPOINT)

    # 1) OSM
    osm_places = run_osm(endpoint)

    # 2) Hav badplatser (optional)
    hav_url = os.environ.get('HAV_BADPLATSER_URL', '').strip()
    hav_places = fetch_hav_badplatser(hav_url) if hav_url else []

    # 3) Municipal dataset (optional generic CSV/JSON)
    muni_url = os.environ.get('MUNICIPAL_DATASET_URL', '').strip()
    muni_type = os.environ.get('MUNICIPAL_DATASET_TYPE', 'auto')
    muni_activity = os.environ.get('MUNICIPAL_ACTIVITY', 'outdoor')
    muni_places = fetch_municipal_dataset(muni_url, muni_type, muni_activity) if muni_url else []

    # Merge
    places = osm_places + hav_places + muni_places

    # Dedupe
    places = dedupe_places(places)

    # Enrich from website OpenGraph/schema.org (limited per run)
    max_enrich = int(os.environ.get('ENRICH_MAX', '200'))
    enrich_places_opengraph(places, max_items=max_enrich)

    # Detect booking capability
    for p in places:
        bt = detect_booking_type(p.get('website'))
        if bt:
            p['bookable'] = True
            p['bookingType'] = bt

    # Write combined JSON and GeoJSON for the map
    (DATA_DIR / 'places.json').write_text(json.dumps(places, ensure_ascii=False), encoding='utf-8')

    # Build GeoJSON for the map from combined places
    features = []
    for idx, pl in enumerate(places):
        if pl.get('lat') is None or pl.get('lon') is None:
            continue
        features.append({
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': [pl['lon'], pl['lat']]},
            'properties': {
                'id': pl.get('id') or f'place/{idx}',
                'name': pl.get('name'),
                'categories': pl.get('categories', []),
                'link': pl.get('website'),
                'osm_url': pl.get('source', {}).get('url'),
                'bookable': pl.get('bookable', False),
            },
        })
    (DATA_DIR / 'friluft.geojson').write_text(json.dumps({'type': 'FeatureCollection', 'features': features}, ensure_ascii=False), encoding='utf-8')

    print(f'OSM: {len(osm_places)}  HAV: {len(hav_places)}  Muni: {len(muni_places)}  Total (deduped): {len(places)}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
