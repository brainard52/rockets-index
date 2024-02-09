import { compressToBase64 } from 'lz-string';
import { decompressFromBase64 } from 'lz-string';
import 'lazysizes';

import cards from "/res/min_cards.json";
import sets_index from "/res/sets_index.json";
import id_to_online_code from "/res/id_to_online_code.json";
import cards_by_index from "/res/cards_by_index.json";
import online_code_to_index from "/res/online_code_to_index.json";
import online_codes from "/res/online_codes.json";
import card_index_by_collector from "/res/card_index_by_collector.json"

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

function resizeAction() {
  if(listArea.style) {
    listArea.removeAttribute("style")
  }
}

function main() {
  window.onbeforeunload = unload;
  submitButton.onclick = updateDisplay;
  clearButton.onclick = resetListArea;
  copyButton.onclick = copyList;
  window.onresize = resizeAction;
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
    if(!(_set in sets_index) || !(card in cards_by_index[_set])) {
      errorCards.push({"set": _set, "card": card});
      console.log(i + " error: " + parameterCards[i])
      continue;
    }

    newListAreaContent = newListAreaContent + getCardLine(count, _set, card) + '\n';
  }
  listArea.value = newListAreaContent;
  if(errorCards.length>0) {
    displayError("This URL is broken. This really shouldn't have happened. Please make fun of Landon on Discord (Username: brainard50) and give him the broken URL. You can alternatively file a bug on Github. Either way, as repentance for his grievous sin he will do his best to extract the list from the URL and provide it to you.")
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
  if( parameters === undefined ) {
    return
  }
  window.location.hash = "#" + compressedParameters;
}

function parameterize(list: Array) {
  let single_parameter_regex = /^\d+,\d+,\d+:$/
  let parameters = "";
  for(let i = 0; i<list.length; i++) {
    let parameter = list[i]["count"]+ ",";
    let setNumber = undefined;
    let collectorNumber = undefined;
    if(list[i]["onlineCode"] in online_code_to_index) {
      for(let j = 0; j < online_code_to_index[list[i]["onlineCode"]].length; j++){
        if(list[i]["collectorNumber"] in card_index_by_collector[online_code_to_index[list[i]["onlineCode"]][j]]){
          setNumber = online_code_to_index[list[i]["onlineCode"]][j];
          collectorNumber = card_index_by_collector[online_code_to_index[list[i]["onlineCode"]][j]][list[i]["collectorNumber"]]
          parameter = parameter + setNumber + "," + collectorNumber + ":";
          break;
        }
      }
    }
    if(setNumber == undefined || collectorNumber == undefined) {
      displayError("Could not find " + list[i]["name"] + " " + list[i]["onlineCode"] + " " + list[i]["collectorNumber"]);
      return;
    }
    if(single_parameter_regex.test(parameter)){
      parameters = parameters + parameter;
    } else {
      displayError("URL Parameter broken", parameter)
      return;
    }
  }
  return parameters.slice(0,-1);// the slice removes the trailing : that gets added with the final card
}

function validateList(list: Array) {
  // 2 Charmander MEW 4
  let errorCards = [];
  let keys = Object.keys(online_codes).sort();
  for(let i = 0; i<list.length; i++) {
    if(!(keys.includes(list[i]["onlineCode"]))) {
      // Will probably break when trying to consume basic energy lines
      console.log("onlineCode Error", list[i]["name"], list[i])
      errorCards.push(list[i]);
      continue;
    }
    let codeArray = online_codes[list[i]["onlineCode"]]
    let collectorNumbers = [];
    for(let i = 0; i<codeArray.length; i++) {
      collectorNumbers = collectorNumbers + cards[codeArray[i]].map(function (card) {return card["number"]}).sort();
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
      image.classList.add("lazyload");
      image.dataset.src = src;
      child.appendChild(image);
    }
  }
  else {
    let image = document.createElement("img");
    image.classList.add("stack");
    image.classList.add("lazyload");
    image.dataset.src = src;
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
    let card = undefined;
    let indices = online_code_to_index[onlineCode]

    for(let j = 0; j < indices.length; j++){
      if(collectorNumber in card_index_by_collector[indices[j]]){
        card = cards_by_index[indices[j]][card_index_by_collector[indices[j]][collectorNumber]];
        break;
      }
    }

    if(card == undefined){
      displayError("This card does not exist: " + count + " " + name + " " + onlineCode + " " + collectorNumber);
      return;
    }
    if("image" in card){
      insertImage(card["image"], count);
    }
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
  return count + ' ' + cards_by_index[_set][card]["name"] + ' ' + sets_index[_set]["onlineCode"] + ' ' + cards_by_index[_set][card]["number"];
}

function appendToArea(area: HtMLDivElement, message: String) {
  area.innerHTML = area.innerHTML + message + '<br/>';
}

window.onload = main;
