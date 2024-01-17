#!/usr/bin/env python3
import json
import csv
from pathlib import Path
import sys

if len(sys.argv) != 4:
    print("3 arguments are required")
    print(f"Example: {sys.argv[0]} base_set_cube.csv base_set_cube_2.csv replacements.csv")
    exit()

if not sys.argv[1].endswith(".csv") or not sys.argv[2].endswith(".csv") or not sys.argv[3].endswith(".json"):
    print("incorrect filetypes provided")
    print("expecting .csv .csv .json")
    exit()

target_1 = sys.argv[1]
target_2 = sys.argv[2]
destination = sys.argv[3]

list_1_file = Path(target_1)
list_2_file = Path(target_2)
destination_file = Path(destination)

list_1 = []
list_2 = []

with open(list_1_file, 'r') as list_1_csv, open(list_2_file, 'r') as list_2_csv:
    list_1_reader = csv.reader(list_1_csv, delimiter=',', quotechar='\"')
    list_2_reader = csv.reader(list_2_csv, delimiter=',', quotechar='\"')
    for line in list_1_reader:
        list_1.append(line)
    for line in list_2_reader:
        list_2.append(line)

if len(list_1) != len(list_2):
    print("List lengths are not the same")
    exit()

index=0

if destination_file.is_file():
    with open(destination_file, 'r') as destination_json:
        destination = json.loads(destination_json.read())
else:
    destination = {}

while index < len(list_1):
    if list_1[index][0] != list_2[index][0] or list_1[index][2] != list_2[index][2]:
        print(f"Cards do not match: {list_1[index]} | {list_2[index]}")

    if list_1[index][1] != list_2[index][1]:
        if list_1[index][1] in destination.keys():
            if destination[list_1[index][1]] != list_2[index][1]:
                print("Set code already recorded, but they do not match.")
                print(f"Recorded: {destination[list_1[index][1]]}")
                print(f"New: {list_2[index][1]}")
        elif list_1[index][1] == "CKCC":
            continue
        else:
            destination[list_1[index][1]] = list_2[index][1]


    index = index + 1

with open(destination_file, 'w') as destination_json:
    destination_json.write(json.dumps(destination, indent=2))
