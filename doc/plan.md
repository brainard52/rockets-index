# Plan and design for Rocket Index
## Creating the supporting files
1. Turn list of all sets into numbered list
2. Turn list of all cards in to numbered list based on their set (`[1,1]` refers to base set Alakazam and `[7,4]` refers to Neo Discovery Magnemite)
3. Create `paste.html`

## paste.html
### On load, the following should happen

1. Clear `listArea`
2. Check for a valid URL argument. 
3. If one is present
    1. Parse argument into list
    2. Place the list into `listArea`
4. If URL argument is not valid
    1. Remove URL argument

### On listArea change:

1. Validate cards
2. If invalid cards are found
    1. Clear card display
    2. Insert error indicating which card is invalid
3. If list is valid:
    1. Update URL
    2. Update shown images

### DisplayImages function:


[example list](Charizard.md)