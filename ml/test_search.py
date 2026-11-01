import urllib.request
import json

data = json.dumps({
    "source": "Mysuru City Bus Stand (CBS)",
    "destination": "Infosys Mysuru Campus",
    "travel_date": "2026-11-02",
    "travel_hour": 9,
}).encode("utf-8")

req = urllib.request.Request(
    "http://127.0.0.1:8000/api/predictions/search",
    data=data,
    headers={"Content-Type": "application/json"},
)

res = json.loads(urllib.request.urlopen(req).read().decode())
print("\n=== Bus Search Results (Mysuru CBS to Infosys) ===")
for b in res:
    rec_tag = "[RECOMMENDED ALTERNATIVE]" if b["is_recommended"] else ""
    print(f"{b['bus_number']}: {b['occupancy_percentage']}% ({b['occupancy_category']}) | ETA: {b['estimated_arrival_mins']}m | {b['crowd_level_text']} {rec_tag}")

occ_res = json.loads(urllib.request.urlopen("http://127.0.0.1:8000/api/occupancy/current").read().decode())
print("\n=== Fleet Live Occupancy Breakdown (Sample of 5) ===")
for b in occ_res[:5]:
    print(f"{b['bus_number']}: {b['occupancy_percentage']}% ({b['occupancy_status']}) - Route: {b['route_number']}")
