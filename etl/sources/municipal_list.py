from typing import List, Dict, Any
import csv
import io
import json
import requests


def fetch_municipal_list(url: str) -> List[Dict[str, Any]]:
    """Fetch a list of Swedish municipalities with optional websites.

    Expected formats:
    - CSV with columns: name, website (optional), county (optional)
    - JSON array of objects with keys: name, website
    """
    if not url:
        return []
    try:
        r = requests.get(url, timeout=30)
        r.raise_for_status()
        content = r.content
    except Exception:
        return []

    # Try JSON first
    try:
        data = json.loads(content.decode('utf-8', errors='replace'))
        out: List[Dict[str, Any]] = []
        if isinstance(data, list):
            for it in data:
                if isinstance(it, dict) and it.get('name'):
                    out.append({'name': it['name'], 'website': it.get('website')})
        return out
    except Exception:
        pass

    # CSV
    try:
        text = content.decode('utf-8', errors='replace')
        reader = csv.DictReader(io.StringIO(text))
        out: List[Dict[str, Any]] = []
        for row in reader:
            name = row.get('name') or row.get('namn')
            if not name:
                continue
            out.append({'name': name, 'website': row.get('website') or row.get('webb')})
        return out
    except Exception:
        return []

