#!/usr/bin/env python3

import json
import natsort
from pathlib import Path

# Need:
# * orderedCodes
# * cards

cards_f = Path("public/cards.json")
orderedCodes_f = Path("public/orderedCodes.json")
orderedCards_f = Path("public/orderedCards.json")

def compareCollector(card):
    return card["number"]

orderedCards = {

        }

with open(cards_f, 'r') as cards_json:
    cards = json.loads(cards_json.read())
with open(orderedCodes_f, 'r') as orderedCodes_json:
    orderedCodes = json.loads(orderedCodes_json.read())

for _set in orderedCodes:
    cards[orderedCodes[_set]["id"]]["cards"] = natsort.natsorted(cards[orderedCodes[_set]["id"]]["cards"], key=compareCollector)
    count = 0
    for card in cards[orderedCodes[_set]["id"]]["cards"]:
        card.pop("set", None)
        if _set not in orderedCards:
            orderedCards[_set] = {
                    }
        orderedCards[_set][count] = card
        count = count+1

with open(orderedCards_f, 'w') as orderedCards_json:
    orderedCards_json.write(json.dumps(orderedCards, indent=2))


