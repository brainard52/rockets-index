#!/usr/bin/env python3
import json
from pathlib import Path

sets_file = Path("../src/res/sets.json")
onlineCodes_file = Path("../src/res/onlineCodes.json")

with open(sets_file, 'r') as sets_json:
    sets = json.loads(sets_json.read())

with open(onlineCodes_file, 'r') as onlineCodes_json:
    onlineCodes = json.loads(onlineCodes_json.read())

i = 0
while i<len(sets["data"]):
    sets["data"][i]["onlineCode"] = onlineCodes[sets["data"][i]["id"]]
    i = i+1

with open(sets_file, 'w') as sets_json:
    sets_json.write(json.dumps(sets, indent=2))
