require('./mystyles.scss');
import { getPayloadString, setModeOptions, hideOnClickOutside, copyToClipboardFromElement } from "./utils";
import { compress, decompress, compressAndEncrypt, decryptAndDecompress } from "./securepaste";
import * as bulmaToast from "bulma-toast";
import { Editor, CodeMirrorEditorObj, TUIEditorObj, setEditorMode } from "./editors";

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
    urlCompressionStatsTextElem: HTMLInputElement, 
    urlModalContainer: HTMLElement, 
    input_str: string, 
    output_str: string, 
    shortmode: string, 
    encodedWEncryption: boolean=false
){
    urlTextBoxElem.value = `file:///D:/Work/Random/random-programming/securepaste/securepaste/index2.html?${shortmode}${output_str}`;
    const compression_ratio = output_str.length / input_str.length;
    urlCompressionStatsTextElem.innerHTML = `
    <p>Input Size: ${input_str.length} characters</p>
    <p>Output Size: ${output_str.length} characters</o>
    <p>Compression Ratio: ${compression_ratio}</p>`;
    if(encodedWEncryption){
        urlCompressionStatsTextElem.innerHTML += "<p>Encryption Overhead: nonceLength=24bytes, overheadLength=16bytes</p>"
    }
    urlModalContainer.classList.add('is-active');
    hideOnClickOutside(urlModalContainer, 'urlModalContainerBackground');
}

function compressAndUpdate(
    urlTextBoxElem: HTMLInputElement,
    urlCompressionStatsTextElem: HTMLInputElement, 
    urlModalContainer: HTMLElement,
    encryptionPasswordTextBox: HTMLInputElement,
    activeEditorObj: Editor,
    shortmode: string,
    passwordStr: string = "",
){
    const input_str = activeEditorObj.getData();
    const output_str = compressInput(input_str, encryptionPasswordTextBox.value);
    updateURLTextWithStats(urlTextBoxElem, urlCompressionStatsTextElem, urlModalContainer, input_str, output_str, modeSelectorElem.value, passwordStr.length > 0);
}

var payload = getPayloadString();
var initialShortMode = "Ce";

var initialCodeStr = ""
if (payload.length > 2){
    try{
        initialShortMode = payload.slice(0, 2);
        initialCodeStr = decompress(payload.slice(2));
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
const codeMirrorEditorObj = new CodeMirrorEditorObj(textAreaElem);
const tuiEditorObj = new TUIEditorObj(tuiEditorDivElem);

const allEditorObjs: Record<string, Editor> = {
    codemirror: codeMirrorEditorObj,
    tui: tuiEditorObj,
}

var activeEditorObj: Editor;
activeEditorObj = setEditorMode(allEditorObjs, null, modeSelectorElem.value, initialCodeStr);
modeSelectorElem.addEventListener('change', (event) => {
    const shortmode = (event.target as HTMLInputElement).value;
    activeEditorObj = setEditorMode(allEditorObjs, activeEditorObj, shortmode, initialCodeStr)
});

const urlModalContainer = (document.getElementById('urlModalContainer') as HTMLElement);
const urlTextBox = (document.getElementById('urlTextBox') as HTMLInputElement);
const urlCopyBtn = (document.getElementById('urlCopyBtn') as HTMLButtonElement);
const submitButton = (document.getElementById("getURLButton") as HTMLButtonElement);
const encryptionPasswordTextBox = (document.getElementById('encryptionPasswordTxt') as HTMLInputElement);
const urlCompressionStatsTextElem = (document.getElementById("urlCompressionStatsText") as HTMLInputElement);
submitButton.addEventListener('click', function (){
    // input_str = editor.getMarkdown();
    compressAndUpdate(
        urlTextBox,
        urlCompressionStatsTextElem,
        urlModalContainer,
        encryptionPasswordTextBox,
        activeEditorObj,
        modeSelectorElem.value,
        modeSelectorElem.value
    );
});

encryptionPasswordTextBox.addEventListener('change', function(event){
    const passwordStr = (event.target as HTMLInputElement).value;
    compressAndUpdate(
        urlTextBox,
        urlCompressionStatsTextElem,
        urlModalContainer,
        encryptionPasswordTextBox,
        activeEditorObj,
        modeSelectorElem.value,
        passwordStr
    );
})

// urlCopyBtn.addEventListener('click', function(){
//     copyToClipboardFromElement(urlTextBox);
//     (document.getElementById('urltooltiptext') as HTMLElement).innerHTML = "Copied!";
// });
// urlCopyBtn.addEventListener('mouseout', function(){
//     (document.getElementById('urltooltiptext') as HTMLElement).innerHTML = "Copy To Clipboard";
// });

var aboutModalContainer = (document.getElementById('aboutModalContainer') as HTMLElement);
var aboutLinkElem = (document.getElementById('aboutModalLink') as HTMLElement);
aboutLinkElem.addEventListener('click', function (){
    aboutModalContainer.classList.add('is-active');
    hideOnClickOutside(aboutModalContainer, 'aboutModalContainerBackground');
});
