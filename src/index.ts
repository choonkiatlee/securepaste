require('./mystyles.scss');
import { getPayloadString, setEditorSelectOptions, hideOnClickOutside, copyToClipboardFromElement, isSmallScreen } from "./utils";
import { compress, decompress, compressAndEncrypt, decryptAndDecompress } from "./securepaste";
import * as bulmaToast from "bulma-toast";
import { Editor, CodeMirrorEditorObj, TUIEditorObj, setEditorMode, SpreadsheetEditorObj } from "./editors";
import { initialiseGoogleChart, drawCompressionStatsChart } from "./compressionDisplay";
import { getShortenedURL } from "./urlshortening";
import { EditorType } from "./editors/editorconfigs";

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
    shortEditorSelect: string,
    encodedWEncryption: boolean = false,
    shortenURL: boolean = false,
){
    const currentBaseURL = window.location.origin + window.location.pathname;
    const isEncryptedIndicator = encodedWEncryption ? "A" : "B";
    console.log(encodedWEncryption, isEncryptedIndicator);

    function updateStatsShortened(url: string){
        updateStatsCommon(url);
        drawCompressionStatsChart(chartElem, input_str.length, 0, 0, url.length);
    }

    function updateStatsLong(output_str: string){
        const url = `${currentBaseURL}?${shortEditorSelect}${isEncryptedIndicator}${output_str}`;
        console.log(url, output_str);
        updateStatsCommon(url);
        const encryption_overhead = encodedWEncryption ? 30 : 0;
        drawCompressionStatsChart(chartElem, input_str.length, 3, encryption_overhead, output_str.length);
    }

    function updateStatsCommon(url: string){
        urlModalContainer.classList.add('is-active');
        urlTextBoxElem.value = url;
    }

    if (shortenURL){
        const longurl = `${currentBaseURL}?${shortEditorSelect}${isEncryptedIndicator}${output_str}`;
        getShortenedURL(longurl, updateStatsShortened)
    }
    else {
        updateStatsLong(output_str)
    }
    hideOnClickOutside(urlModalContainer, 'urlModalContainerBackground');

}

function compressAndUpdate(
    urlTextBoxElem: HTMLInputElement,
    chartElem: HTMLDivElement, 
    urlModalContainer: HTMLElement,
    encryptionPasswordTextBox: HTMLInputElement,
    activeEditorObj: Editor,
    shortEditorSelect: string,
    shortenURL: boolean = false,
){
    const passwordStr = encryptionPasswordTextBox.value;
    const input_str = activeEditorObj.getData();
    const output_str = compressInput(input_str, passwordStr);
    updateURLTextWithStats(urlTextBoxElem, urlCompressionStatsTextElem, urlModalContainer, input_str, output_str, shortEditorSelect, passwordStr.length > 0, shortenURL);
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
var initialShortEditorSelect = isSmallScreen() ? EditorType.CODE : EditorType.MARKDOWN;
var isEncrypted = false;

var initialCodeStr = ""
if (payload.length > 1){
    try{
        initialShortEditorSelect = (payload.slice(0, 1) as EditorType);
        isEncrypted = (payload.slice(1,2) == "A");
        console.log(initialShortEditorSelect, isEncrypted, payload.slice(2));
        if (!isEncrypted){
            initialCodeStr = decompress(payload.slice(2));
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

const editorSelectorElem: HTMLSelectElement = (document.getElementById("editorSelector") as HTMLSelectElement);
setEditorSelectOptions(editorSelectorElem);
editorSelectorElem.value = initialShortEditorSelect;

const codeMirrorDivElem: HTMLDivElement = (document.getElementById("codeMirrorDivElem") as HTMLDivElement);
const tuiEditorDivElem: HTMLDivElement = (document.getElementById("tuiEditorDivElem") as HTMLDivElement);
const spreadsheetEditorDivElem: HTMLDivElement = (document.getElementById("spreadsheetDivElem") as HTMLDivElement);
const navBarEditorToolsOptionsElem: HTMLDivElement = (document.getElementById("navBarEditorToolsOptions") as HTMLDivElement);
const codeMirrorEditorObj = new CodeMirrorEditorObj(codeMirrorDivElem, navBarEditorToolsOptionsElem);
const tuiEditorObj = new TUIEditorObj(tuiEditorDivElem);
const spreadsheetEditorObj = new SpreadsheetEditorObj(spreadsheetEditorDivElem);

const allEditorObjs: { [key in EditorType]: Editor} = {
    "A": codeMirrorEditorObj,
    "B": tuiEditorObj,
    "C": spreadsheetEditorObj,   
}

var activeEditorObj: Editor;
activeEditorObj = setEditorMode(allEditorObjs, null, (editorSelectorElem.value as EditorType), initialCodeStr);
editorSelectorElem.addEventListener('change', (event) => {
    const shortEditorSelect = ((event.target as HTMLInputElement).value as EditorType);
    activeEditorObj = setEditorMode(allEditorObjs, activeEditorObj, shortEditorSelect, "")
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
        editorSelectorElem.value,
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
        editorSelectorElem.value,
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
        editorSelectorElem.value,
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
        setEditorMode(allEditorObjs, activeEditorObj, (editorSelectorElem.value as EditorType), initialCodeStr);
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
        editorSelectorElem.value,
        shortenURLCheckbox.checked,
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

