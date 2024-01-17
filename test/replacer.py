#!/usr/bin/env python3
import json
import csv
from pathlib import Path
import sys

target = sys.argv[1]
replacements_file = "replacements.json"

result = ""

with open(replacements_file, 'r') as replacements_json:
    replacements = json.loads(replacements_json.read())

results = []
with open(target, 'r') as list_csv:
    _list = csv.reader(list_csv, delimiter=',', quotechar='\"')
    for line in _list:
        if line[1] in replacements.keys():
            line[1] = replacements[line[1]]
        results.append(line)

with open(target, 'w') as list_csv:
    _list = csv.writer(list_csv, delimiter=',', quotechar='\"')
    for line in results:
        _list.writerow(line)


