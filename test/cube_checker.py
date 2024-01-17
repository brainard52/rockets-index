#!/usr/bin/env python3
import json
import csv
from pathlib import Path
import sys

target = sys.argv[1]
destination = sys.argv[2]

list_file = Path(target)
destination_file = Path(destination)

sets_file = Path("../src/res/sets.json")

with open(sets_file, 'r') as sets_json:
    sets = json.loads(sets_json.read())['data']

onlineCodes = [x['onlineCode'] for x in sets]

result = ""
with open(list_file, 'r') as list_csv:
    _list = csv.reader(list_csv, delimiter=',', quotechar='\"')
    for line in _list:
        if line[1] in onlineCodes:
            result = result + f"1 {line[0]} {line[1]} {line[2]}\n"
        else:
            print(line)

with open(destination_file, 'w') as dest_txt:
    dest_txt.write(result)







