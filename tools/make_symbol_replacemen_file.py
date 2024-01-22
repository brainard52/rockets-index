#!/usr/bin/env python3

import re
import json

with open("../src/res/cards.json", 'r') as cards_json:
    cards = json.loads(cards_json.read())

name_chars = re.compile(r"[^a-zA-Z0-9\:\-'\" \(\)\\\’\.\&é_\[\]!\#\?]+")

special = []

for set_ in cards:
    for card in cards[set_]["cards"]:
        found = name_chars.search(card["name"])
        if found and "ナッシー" not in card["name"]:
            span = found.span()
            if card["name"][span[0]:span[1]] not in special:
                special.append(card["name"][span[0]:span[1]])

print(special)
