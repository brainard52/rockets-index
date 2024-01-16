#!/usr/bin/env python3

import requests
import json
from pathlib import Path
import datetime

headers = {
        'X-Api-Key':'3c3892ce-fdcf-4e50-81b0-7dcd13bfa595',
        'user-agent': 'Cube tool V0.0.1 - Discord: brainard50'
        }

set_endpoint = "https://api.pokemontcg.io/v2/sets?orderBy=releaseDate"
card_endpoint = "https://api.pokemontcg.io/v2/cards"

def mkdir(_dir):
    if not _dir.is_dir():
        if _dir.exists():
            print("{_dir} already exists and is not a directory.")
            exit()
        _dir.mkdir()

ttl = datetime.timedelta(days=7)

shim = {
        "mcd11": "MCD11",
        "mcd12": "MCD12",
        "mcd14": "MCD14",
        "mcd15": "MCD15",
        "mcd16": "MCD16",
        "mcd17": "MCD17",
        "mcd18": "MCD18",
        "mcd19": "MCD19",
        "mcd21": "MCD21",
        "mcd22": "MCD22",
        "pop1": "POP1",
        "pop2": "POP2",
        "pop3": "POP3",
        "pop4": "POP4",
        "pop5": "POP5",
        "pop6": "POP6",
        "pop7": "POP7",
        "pop8": "POP8",
        "pop9": "POP9",
        "ru1": "RM",
        "si1": "SI",
        "sma": "SMA",
        "tk1a": "TK1A",
        "tk1b": "TK1B",
        "tk2a": "TK2A",
        "tk2b": "TK2B",
        "sv1": "SVI",
        "sv2": "PAL",
        "sve": "SVE",
        "sv3": "OBF",
        "sv3pt5": "MEW",
        "sv4": "PAR"
        }

def main():
    response = requests.get(set_endpoint, headers=headers)
    if response.status_code != 200:
        print(f"bad response: {response.status_code}")
        return
    if response.headers["Content-Type"] != "application/json; charset=utf-8":
        print(f"{response.headers['Content-Type']} is not utf-8 json")
        return
    sets = json.loads(response.content)

    setCodes = {

            }

    for set in sets["data"]:
        if "ptcgoCode" in set.keys():
            if set["ptcgoCode"] not in setCodes:
                setCodes[set["ptcgoCode"]] = []
            setCodes[set["ptcgoCode"]].append(set["id"])
        elif set["id"] in shim.keys():
            if shim[set["id"]] not in setCodes:
                setCodes[shim[set["id"]]] = []
            setCodes[shim[set["id"]]].append(set["id"])
        else:
            print(f'{set["id"]} not in shim')

    with open("onlineCodes.json", 'w') as setCodes_json:
        setCodes_json.write(json.dumps(setCodes, indent=2))

if __name__ == "__main__":

    main()


