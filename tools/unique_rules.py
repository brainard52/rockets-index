#!/usr/bin/env python3

import json

with open("../src/res/cards.json", 'r') as cards_json:
    cards = json.loads(cards_json.read())

examples = []

types = []

for set_ in cards:
    for card in cards[set_]["cards"]:
            if "rules" in card and card["supertype"] == "Pokémon":
                for rule in card["rules"]:
                    if "ule" in rule and rule not in examples:
                        print(rule)
                        examples.append(rule)
