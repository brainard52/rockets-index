#!/usr/bin/env python3

import json
import natsort

with open("../src/res/cards.json", 'r') as cards_json:
    cards = json.loads(cards_json.read())

with open("../src/res/onlineCodes.json") as onlineCodes_json:
    onlineCodes = json.loads(onlineCodes_json.read())

indexes = {}

def set_date(code):
    return cards[code]["date"]
def card_code(card):
    return card["number"]

setCodes_by_date = natsort.natsorted(cards.keys(), key=set_date)
setIndex = 0
for code in setCodes_by_date:
    indexes[code] = {
            "index": setIndex,
            "cards": {}
            }

    cards[code]["cards"] = natsort.natsorted(cards[code]["cards"], key=card_code)
    cardIndex = 0
    for card in cards[code]["cards"]:
        indexes[code]["cards"][card["number"]] = cardIndex
        cardIndex= cardIndex + 1
    setIndex = setIndex + 1

with open("indexes.json", 'w') as indexes_json:
    indexes_json.write(json.dumps(indexes, indent=2))


