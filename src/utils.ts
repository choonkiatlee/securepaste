import { modeInfo, typeInfo } from "./editors/editorconfigs";

export function loadScript(src: string) {
    return new Promise(function (resolve, reject) {
        var s;
        s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

export function loadStyleSheet(src: string) {
    return new Promise(function(resolve, reject){
        var s;
        s = document.createElement('link');
        s.rel = "stylesheet"
        s.href = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    })
}

export function getPayloadString(): string{
    const url = new URL(window.location.href); // todo: is this what we want? 
    var payload = url.search;
    if (payload.length > 0 && payload[0] == "?"){
        payload = payload.slice(1);
    }
    return payload;
}

export function copyToClipboardFromElement(inputElementToCopy: HTMLInputElement) {
    /* Select the text field */
    inputElementToCopy.select();
    inputElementToCopy.setSelectionRange(0, 99999); /* For mobile devices */
  
    /* Copy the text inside the text field */
    document.execCommand("copy");
}

export function setSelectOptions(selectElem: HTMLSelectElement, reference_dict: Object){
    Object.entries(reference_dict).forEach(element => {
        var el = document.createElement("option");
        el.textContent = element[1]["name"];
        el.value = element[0];
        selectElem.appendChild(el);
    });
}

export function setEditorSelectOptions(selectElem: HTMLSelectElement){
    setSelectOptions(selectElem, typeInfo);
}

export function setCodeMirrorSelectOptions(selectElem: HTMLSelectElement){
    setSelectOptions(selectElem, modeInfo)
    debugger;
}

export function hideOnClickOutside(element: HTMLElement, backgroundId: string) {
    const outsideClickListener = (event: MouseEvent) => {
        if ((event.target as HTMLElement).id == backgroundId) { // or use: event.target.closest(selector) === null
          element.classList.remove('is-active')
          removeClickListener()
        }
    }
    const removeClickListener = () => {
        document.removeEventListener('click', outsideClickListener)
    }

    document.addEventListener('click', outsideClickListener)
}

export function isSmallScreen(): boolean{
    var mq = window.matchMedia( "(max-width: 570px)" );
    return mq.matches;
}