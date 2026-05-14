import os
import httpx
from dotenv import load_dotenv

load_dotenv()

DIRECTUS_URL = os.getenv("DIRECTUS_URL")
DIRECTUS_TOKEN = os.getenv("DIRECTUS_TOKEN")

if not DIRECTUS_URL or not DIRECTUS_TOKEN:
    print("Error: DIRECTUS_URL and DIRECTUS_TOKEN must be set in .env")
    exit(1)

HEADERS = {
    "Authorization": f"Bearer {DIRECTUS_TOKEN}",
    "Content-Type": "application/json"
}

def create_collection():
    url = f"{DIRECTUS_URL}/collections"
    payload = {
        "collection": "TOW_Data",
        "meta": {
            "display_name": "Tug of War Data",
            "icon": "sports_kabaddi",
            "note": "Data captured from Tug of War iPad app"
        },
        "schema": {}
    }
    
    print(f"Creating collection TOW_Data...")
    resp = httpx.post(url, json=payload, headers=HEADERS)
    if resp.status_code == 200:
        print("Collection TOW_Data created successfully.")
    elif resp.status_code == 400 and "already exists" in resp.text:
        print("Collection TOW_Data already exists.")
    else:
        print(f"Failed to create collection: {resp.text}")
        return False
    return True

def create_field(collection, field_name, field_type="string", interface="input"):
    url = f"{DIRECTUS_URL}/fields/{collection}"
    payload = {
        "field": field_name,
        "type": field_type,
        "meta": {
            "interface": interface,
            "display_name": field_name.replace("_", " ").title()
        }
    }
    
    print(f"Creating field {field_name} in {collection}...")
    resp = httpx.post(url, json=payload, headers=HEADERS)
    if resp.status_code == 200:
        print(f"Field {field_name} created successfully.")
    elif resp.status_code == 400 and "already exists" in resp.text:
        print(f"Field {field_name} already exists.")
    else:
        print(f"Failed to create field {field_name}: {resp.text}")

if __name__ == "__main__":
    if create_collection():
        fields = [
            ("mr_code", "string"),
            ("mr_name", "string"),
            ("hcp_name", "string"),
            ("hcp_code", "string"),
            ("time_spent", "string"),
            ("winner", "string")
        ]
        
        for field_name, field_type in fields:
            create_field("TOW_Data", field_name, field_type)
        
        print("\nDirectus setup complete!")
