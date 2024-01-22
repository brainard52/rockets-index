#!/usr/bin/env python3

import json

with open("../src/res/cards.json", 'r') as cards_json:
    cards = json.loads(cards_json.read())

new_cards = {}

for set_ in cards:
    new_cards[set_] = []
    for card in cards[set_]["cards"]:
        new_card = {}
        rules = []

        if "rules" in card:
            for rule in card["rules"]:
                if "ule" in rule:
                    rules.append(rule)
        new_card["name"] = card["name"]
        new_card["supertype"] = card["supertype"]
        new_card["number"] = card["number"]
        new_card["image"] = card["images"]["large"]
        if "subtypes" in card:
            new_card["subtypes"] = card["subtypes"]

        if card["supertype"] == "Pok\u00e9mon":
            new_card["types"] = card["types"]
            if "evolvesFrom" in card:
                new_card["evolvesFrom"] = card["evolvesFrom"]
            if len(rules) > 0:
                new_card["rules"] = rules
        new_cards[set_].append(new_card)


with open("min_cards.json", 'w') as min_cards_json:
    min_cards_json.write(json.dumps(new_cards, indent=2))

