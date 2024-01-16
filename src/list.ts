import { compressToBase64 } from 'lz-string';
import { decompressFromBase64 } from 'lz-string';

import sets from "/res/sets.json";
import cards from "/res/cards.json";
import orderedCodes from "/res/orderedCodes.json";
import orderedCards from "/res/orderedCards.json";
import onlineCodes from "/res/onlineCodes.json";

const submitButton = document.getElementById("submitButton")! as HTMLInputElement;
const copyButton = document.getElementById("copyButton")! as HTMLInputElement;
const clearButton = document.getElementById("clearButton")! as HTMLInputElement;
const listArea = document.getElementById("listArea")! as HTMLDivElement;
const displayArea = document.getElementById("displayArea")! as HTMLDivElement;
const errorArea = document.getElementById("errorArea")! as HTMLDivElement;

const parameterRegex = /^[:,\d]*$/g;
/* Make the textArea resize with text entry - From SO */
const tx = document.getElementsByTagName("textarea");
for (let i = 0; i < tx.length; i++) {
  tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;");
  tx[i].addEventListener("input", OnTextAreaInput, false);
}

function OnTextAreaInput() {
  this.style.height = 0;
  this.style.height = (this.scrollHeight) + "px";
}

/******************************************************/

function resetListArea() {
  listArea.value = "";
  updateDisplay();
}

function copyList() {
  if(listArea.value != ""){
    console.log("Copied List to clipboard");
    navigator.clipboard.writeText(listArea.value);
  }
}

function main() {
  window.onbeforeunload = unload;
  submitButton.onclick = updateDisplay;
  clearButton.onclick = resetListArea;
  copyButton.onclick = copyList;
  loadUrlParameters();
}

function unload() {
  clearErrors();
  listArea.value = "";
}

function loadUrlParameters() {
  let compressedText = window.location.hash.slice(1);
  if(compressedText.length < 1) { // No URL parameters exist
    console.log("No parameters detected")
    return;
  }
  let decompressedParameters = decompress(compressedText);
  let parameterCards = "";
  if(!parameterRegex.test(parameterCards)) {
    window.location.hash = "";
    displayError("URL is Incorrect.");
    return;
  }
  if(decompressedParameters) {
    parameterCards = decompressedParameters.split(":");
  }
  let errorCards = new Array();
  let newListAreaContent = ""
  for (let i = 0; i< parameterCards.length; i++) {
    let [count, _set, card]= parameterCards[i].split(",");
    if(!(_set in orderedCodes) || !(card in orderedCards[_set])) {
      errorCards.push({"set": _set, "card": card});
      continue;
    }

    newListAreaContent = newListAreaContent + getCardLine(count, _set, card) + '\n';
  }
  listArea.value = newListAreaContent;
  if(errorCards.length>0) {
    for(let i = 0; i < errorCards.length; i++) {
      displayError("card " + errorCards[i]["card"] + " from set " + errorCards[i]["set"] + " does not exist.");
    }
    return;
  }
  updateDisplay();
}

function compress(value) {
  return compressToBase64(value).replace("+", "-").replace("/", "_").replace("=", "~");
}
function decompress(compressedValue) {
  return decompressFromBase64(compressedValue.replace("-", "+").replace("_","/").replace("~","="));
}

function setUrlParameters(list) {
  let parameters = parameterize(list);
  let compressedParameters = compress(parameters);
  window.location.hash = "#" + compressedParameters;
  console.log("Length of parameters", parameters.length);
  console.log("Length of compressed parameters", compressedParameters.length);
}

function parameterize(list: Array) {
  let single_parameter_regex = /^\d+,\d+,\d+:$/
  let parameters = "";
  for(let i = 0; i<list.length; i++) {
    let parameter = list[i]["count"]+ ",";
    let setNumber = null;
    for(let j = 0; j < Object.keys(orderedCodes).length; j++) {
      if(orderedCodes[j]["onlineCode"] == list[i]["onlineCode"]) {
        let collectorNumbers = cards[orderedCodes[j]["id"]]["cards"].map(function (card) {return card["number"]}).sort();
        if(collectorNumbers.includes(list[i]["collectorNumber"])){
          parameter = parameter + j + ",";
          setNumber = j;
          break;
        }
      }
    }
    for(let j = 0; j < Object.keys(orderedCards[setNumber]).length; j++) {
      if(list[i]["collectorNumber"] == orderedCards[setNumber][j]["number"]) {
        parameter = parameter + j + ":";
        break;
      }
    }
    if(single_parameter_regex.test(parameter)){
      parameters = parameters + parameter;
    }
  }
  return parameters.slice(0,-1);// the slice removes the trailing : that gets added with the final card
}

function validateList(list: Array) {
  // 2 Charmander MEW 4
  let errorCards = [];
  let keys = Object.keys(onlineCodes).sort();
  for(let i = 0; i<list.length; i++) {
    if(!(keys.includes(list[i]["onlineCode"]))) {
      // Will probably break when trying to consume basic energy lines
      console.log("onlineCode Error", list[i]["name"], list[i])
      errorCards.push(list[i]);
      continue;
    }
    let codeArray = onlineCodes[list[i]["onlineCode"]]
    let collectorNumbers = [];
    for(let i = 0; i<codeArray.length; i++) {
      collectorNumbers = collectorNumbers + cards[codeArray[i]]["cards"].map(function (card) {return card["number"]}).sort();
    }
    if(!(collectorNumbers.includes(list[i]["collectorNumber"]))){
      console.log("collectorNumber Error", list[i]["name"], list[i])
      errorCards.push(list[i]);
      continue;
    }
  }
  if(errorCards.length>0) {
    for(let i = 0; i < errorCards.length; i++) {
      if(errorCards[i]["onlineCode"] == "Energy") {
        displayError("<b>NOTE: basic energy should look like 6 Fire Energy SVE 2</b>");
      }
      else {
        displayError("The card " + errorCards[i]["name"] + " from set " + errorCards[i]["onlineCode"] + " with collector number " + errorCards[i]["collectorNumber"] + " does not exist.");
      }
    }
  }
  else {
    disableError();
  }
  return errorCards;
}

function listify(rawList: Array) {
  let list = [];
  for(let i = 0; i < rawList.length; i++) {
    let card = rawList[i].split(" ");
    list.push({
      "count": Number(card[0]),
      "name": card.slice(1, -2).join(" "),
      "onlineCode": card[card.length-2],
      "collectorNumber": card[card.length-1]
    });
  }
  return list;
}

function updateDisplay() {
  let rawList = listArea.value.split('\n').filter(function (line) { return line.length > 0; });
  let list = listify(rawList);
  let errorCards = validateList(list);
  if(errorCards.length > 0) {
    for(let i = 0; i < errorCards.length; i++) {
      let name = errorCards[i]["name"];
      let onlineCode = errorCards[i]["onlineCode"];
      let collectorNumber = errorCards[i]["collectorNumber"];
      displayError( name + " " + onlineCode + " " + collectorNumber + " could not be found");
    }
    return;
  }
  if(list.length > 0) {
    setUrlParameters(list);
    updateImages(list);
  }
  else {
    window.location.hash = "";
    clearDisplay();
  }
}

function insertImage(src, count) {
  let numbers = ["","one", "two", "three", "four", "more"]

  let child = document.createElement("div");
  child.classList.add("child")
  child.classList.add(count < 5 ? numbers[count] : numbers[5])

  if(count < 5) {
    for(let i = 0; i < count; i++) {
      let image = document.createElement("img");
      image.classList.add("stack");
      image.src = src;
      image.loading = "lazy";
      child.appendChild(image);
    }

  }
  else {
    let image = document.createElement("img");
    image.classList.add("stack");
    image.src = src;
    child.appendChild(image);
    let bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.innerHTML = count;
    child.appendChild(bubble);
  }
  displayArea.appendChild(child);
}

function updateImages(list) {
  clearDisplay();
  for(let i=0; i<list.length; i++) {
    let count = list[i]["count"]
    let name = list[i]["name"]
    let onlineCode = list[i]["onlineCode"]
    let collectorNumber = list[i]["collectorNumber"]
    let setId = undefined;
    let ids = onlineCodes[onlineCode]

    for(let j = 0; j < ids.length; i++){
      let collectorNumbers = cards[ids[j]]["cards"].map(function (card) {return card["number"]}).sort();
      if(collectorNumbers.includes(collectorNumber)) {
        setId = ids[j];
        break;
      }
    }
    let _cards = cards[setId]["cards"];
    let card = undefined;
    for(let j = 0; j < _cards.length; j++) {
      if(_cards[j]["number"] == collectorNumber){
        card = _cards[j];
        break;
      }
    }
    insertImage(card["images"]["small"], count);
  }
}
function clearDisplay() {
  displayArea.innerHTML = ""
}

function displayErrors(messages: Array) {
  for(let i = 0; i<messages.length; i++) {
    displayError(messages[i]);
  }
}

function clearErrors() {
  errorArea.innerHTML = "";
}

function enableError() {
  if(!(displayArea.classList.contains("hide"))) {
    displayArea.classList.add("hide");
  }
  if(errorArea.classList.contains("hide")) {
    errorArea.classList.remove("hide");
  }
}

function disableError() {
  clearErrors()
  if(displayArea.classList.contains("hide")) {
    displayArea.classList.remove("hide");
  }
  if(!(errorArea.classList.contains("hide"))) {
    errorArea.classList.add("hide");
  }
}

function displayError(message: String) {
  enableError();
  appendToArea(errorArea, message);

}

function getCardLine(count: Number, _set: Number, card: Number) {
  return count + ' ' + orderedCards[_set][card]["name"] + ' ' + orderedCodes[_set]["onlineCode"] + ' ' + orderedCards[_set][card]["number"];
}

function appendToArea(area: HtMLDivElement, message: String) {
  area.innerHTML = area.innerHTML + message + '<br/>';
}



window.onload = main;
