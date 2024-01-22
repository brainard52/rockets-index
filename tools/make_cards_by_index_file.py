#!/usr/bin/env python3

import json
import natsort

with open("../src/res/cards.json", 'r') as cards_json:
    cards = json.loads(cards_json.read())

with open("../src/res/onlineCodes.json") as onlineCodes_json:
    onlineCodes = json.loads(onlineCodes_json.read())

cards_by_index = {}

def set_date(code):
    return cards[code]["date"]
def card_code(card):
    return card["number"]

setCodes_by_date = natsort.natsorted(cards.keys(), key=set_date)

setIndex = 0
for code in setCodes_by_date:
    cards_by_index[setIndex] = {
            "code": code,
            "cards": {}
            }

    cards[code]["cards"] = natsort.natsorted(cards[code]["cards"], key=card_code)
    cardIndex = 0
    for card in cards[code]["cards"]:
        cards_by_index[setIndex]["cards"][cardIndex] = card["number"]
        cardIndex= cardIndex + 1
    setIndex = setIndex + 1

with open("cards_by_index.json", 'w') as cards_by_index_json:
    cards_by_index_json.write(json.dumps(cards_by_index, indent=2))

