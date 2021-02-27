require('./mystyles.scss');
import { getPayloadString, setModeOptions, hideOnClickOutside, copyToClipboardFromElement, isSmallScreen } from "./utils";
import { compress, decompress, compressAndEncrypt, decryptAndDecompress } from "./securepaste";
import * as bulmaToast from "bulma-toast";
import { Editor, CodeMirrorEditorObj, TUIEditorObj, setEditorMode, SpreadsheetEditorObj } from "./editors";
import { initialiseGoogleChart, drawCompressionStatsChart } from "./compressionDisplay";
import { getShortenedURL } from "./urlshortening";

function compressInput(input_str: string, passwordStr:string){
    if (passwordStr.length == 0){
        return compress(input_str);
    }
    else{
        return compressAndEncrypt(input_str, passwordStr);
    }
}

function updateURLTextWithStats(
    urlTextBoxElem: HTMLInputElement,
    chartElem: HTMLDivElement, 
    urlModalContainer: HTMLElement, 
    input_str: string, 
    output_str: string, 
    shortmode: string,
    encodedWEncryption: boolean = false,
    shortenURL: boolean = false,
){
    const currentBaseURL = window.location.origin + window.location.pathname;
    const isEncryptedIndicator = encodedWEncryption ? "A" : "B";
    console.log(encodedWEncryption, isEncryptedIndicator);
    const longurl = `${currentBaseURL}?${shortmode}${isEncryptedIndicator}${output_str}`;

    function updateStatsShortened(url: string){
        updateStatsCommon(url);
        drawCompressionStatsChart(chartElem, input_str.length, 0, 0, url.length);
    }

    function updateStatsLong(output_str: string){
        const url = `${currentBaseURL}?${shortmode}${isEncryptedIndicator}${output_str}`;
        updateStatsCommon(url);
        const encryption_overhead = encodedWEncryption ? 30 : 0;
        drawCompressionStatsChart(chartElem, input_str.length, 3, encryption_overhead, output_str.length);
    }

    function updateStatsCommon(url: string){
        urlModalContainer.classList.add('is-active');
        urlTextBoxElem.value = url;
    }

    if (shortenURL){
        getShortenedURL(longurl, updateStatsShortened)
    }
    else {
        updateStatsLong(longurl)
    }
    hideOnClickOutside(urlModalContainer, 'urlModalContainerBackground');

}

function compressAndUpdate(
    urlTextBoxElem: HTMLInputElement,
    chartElem: HTMLDivElement, 
    urlModalContainer: HTMLElement,
    encryptionPasswordTextBox: HTMLInputElement,
    activeEditorObj: Editor,
    shortmode: string,
    shortenURL: boolean = false,
){
    const passwordStr = encryptionPasswordTextBox.value;
    const input_str = activeEditorObj.getData();
    const output_str = compressInput(input_str, passwordStr);
    updateURLTextWithStats(urlTextBoxElem, urlCompressionStatsTextElem, urlModalContainer, input_str, output_str, shortmode, passwordStr.length > 0, shortenURL);
}

function showModal(modalContainerElem: HTMLElement){
    modalContainerElem.classList.add('is-active');
}

function hideModal(modalContainerElem: HTMLElement){
    modalContainerElem.classList.remove('is-active');
}

// Remove whitespace if is small screen
isSmallScreen() ? (document.getElementById("outer-container") as HTMLElement).classList.remove("is-fluid") : "";

var payload = getPayloadString();
var initialShortMode = isSmallScreen() ? "A7" : "Cf"; //"Ce";   // Javascript if is small screen else markdown
var isEncrypted = false;

var initialCodeStr = ""
if (payload.length > 2){
    try{
        initialShortMode = payload.slice(0, 2);
        isEncrypted = (payload.slice(2,3) == "A");
        if (!isEncrypted){
            initialCodeStr = decompress(payload.slice(3));
        } else {            
            var decryptPasswordModalContainer = (document.getElementById('decryptModalContainer') as HTMLElement);
            var decryptPasswordTextBoxElem = (document.getElementById('decryptPasswordTextBox') as HTMLInputElement);
            decryptPasswordTextBoxElem.focus();
            showModal(decryptPasswordModalContainer);
            hideOnClickOutside(decryptPasswordModalContainer, 'decryptModalContainerBackground');
        }
    } catch (err) {
        console.log(err);
        bulmaToast.toast({
            message: `Could not decompress the input. ${err}`, 
            type: "is-danger",
            position: "top-center",
            duration: 5000,
            dismissible: true,
        });
    }
};

const modeSelectorElem: HTMLSelectElement = (document.getElementById("modeSelector") as HTMLSelectElement);
setModeOptions(modeSelectorElem);
modeSelectorElem.value = initialShortMode;

const textAreaElem: HTMLTextAreaElement = (document.getElementById("textAreaElem") as HTMLTextAreaElement);
const tuiEditorDivElem: HTMLDivElement = (document.getElementById("tuiEditorDivElem") as HTMLDivElement);
const spreadsheetEditorDivElem: HTMLDivElement = (document.getElementById("spreadsheetDivElem") as HTMLDivElement);
const codeMirrorEditorObj = new CodeMirrorEditorObj(textAreaElem);
const tuiEditorObj = new TUIEditorObj(tuiEditorDivElem);
const spreadsheetEditorObj = new SpreadsheetEditorObj(spreadsheetEditorDivElem);

const allEditorObjs: Record<string, Editor> = {
    codemirror: codeMirrorEditorObj,
    tui: tuiEditorObj,
    spreadsheet: spreadsheetEditorObj,
}

var activeEditorObj: Editor;
activeEditorObj = setEditorMode(allEditorObjs, null, modeSelectorElem.value, initialCodeStr);
modeSelectorElem.addEventListener('change', (event) => {
    const shortmode = (event.target as HTMLInputElement).value;
    activeEditorObj = setEditorMode(allEditorObjs, activeEditorObj, shortmode, "")
});

const urlModalContainer = (document.getElementById('urlModalContainer') as HTMLElement);
const urlTextBox = (document.getElementById('urlTextBox') as HTMLInputElement);
const urlCopyBtn = (document.getElementById('urlCopyBtn') as HTMLButtonElement);
const shortenURLCheckbox = (document.getElementById('shortenLinkCheckbox') as HTMLInputElement);
const submitButton = (document.getElementById("getURLButton") as HTMLButtonElement);
const encryptionPasswordTextBox = (document.getElementById('encryptionPasswordTxt') as HTMLInputElement);
const urlCompressionStatsTextElem = (document.getElementById("urlCompressionStatsText") as HTMLInputElement);
const chartElem = (document.getElementById('chart_div') as HTMLDivElement);
initialiseGoogleChart(chartElem);

submitButton.addEventListener('click', function (){
    compressAndUpdate(
        urlTextBox,
        chartElem,
        urlModalContainer,
        encryptionPasswordTextBox,
        activeEditorObj,
        modeSelectorElem.value,
        shortenURLCheckbox.checked,
    );
});

shortenURLCheckbox.addEventListener('change', function(event){
    compressAndUpdate(
        urlTextBox,
        chartElem,
        urlModalContainer,
        encryptionPasswordTextBox,
        activeEditorObj,
        modeSelectorElem.value,
        (event.currentTarget as HTMLInputElement).checked,
    );
})

encryptionPasswordTextBox.addEventListener('change', function(event){
    compressAndUpdate(
        urlTextBox,
        urlCompressionStatsTextElem,
        urlModalContainer,
        encryptionPasswordTextBox,
        activeEditorObj,
        modeSelectorElem.value,
        shortenURLCheckbox.checked,
    );
})

urlCopyBtn.addEventListener('click', function(){
    copyToClipboardFromElement(urlTextBox);
    (document.getElementById('urltooltiptext') as HTMLElement).innerHTML = "Copied!";
});
urlCopyBtn.addEventListener('mouseout', function(){
    (document.getElementById('urltooltiptext') as HTMLElement).innerHTML = "Copy To Clipboard";
});

var aboutModalContainer = (document.getElementById('aboutModalContainer') as HTMLElement);
var aboutLinkElem = (document.getElementById('aboutModalLink') as HTMLElement);
aboutLinkElem.addEventListener('click', function (){
    aboutModalContainer.classList.add('is-active');
    hideOnClickOutside(aboutModalContainer, 'aboutModalContainerBackground');
});

var decryptPasswordTextBoxElem = (document.getElementById('decryptPasswordTextBox') as HTMLInputElement);
var decryptPasswordBtn = (document.getElementById('decryptBtn') as HTMLButtonElement);
decryptPasswordBtn.addEventListener('click', function(){
    const passwordStr = decryptPasswordTextBoxElem.value;
    try{
        initialCodeStr = decryptAndDecompress(payload.slice(3), passwordStr);
        hideModal(decryptPasswordModalContainer);
        setEditorMode(allEditorObjs, activeEditorObj, modeSelectorElem.value, initialCodeStr);
    } catch (err) {
        decryptPasswordBtn.classList.add('is-danger');
        decryptPasswordBtn.innerHTML = "Wrong password! Could not decrypt";
    }
});


// Catch interesting keypresses
document.onkeydown = keydown;

function keydown(event: KeyboardEvent){
  if (event.ctrlKey && (event.key == "S" || event.key == "s")){ //CTRL+s
    compressAndUpdate(
        urlTextBox,
        urlCompressionStatsTextElem,
        urlModalContainer,
        encryptionPasswordTextBox,
        activeEditorObj,
        modeSelectorElem.value,
        shortenURLCheckbox.value == "on" ? true : false,
    );
    event.preventDefault();
  }
};

decryptPasswordTextBoxElem.addEventListener("keyup", function(event: KeyboardEvent) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.key === "Enter") {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      decryptPasswordBtn.click();
    }
});

// Get all "navbar-burger" elements
const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

// Check if there are any navbar burgers
if ($navbarBurgers.length > 0) {

  // Add a click event on each of them
  $navbarBurgers.forEach( el => {
    el.addEventListener('click', () => {

      // Get the target from the "data-target" attribute
      const target = el.dataset.target;
      const $target = (document.getElementById(target) as HTMLElement);

      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      el.classList.toggle('is-active');
      $target.classList.toggle('is-active');
    });
  });
}

