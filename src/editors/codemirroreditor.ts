import { Editor } from "../editors";
import { loadStyleSheet, loadScript, setEditorSelectOptions } from "../utils";
import CodeMirror from "codemirror";
import { EditorType, modeInfo } from "./editorconfigs";
import { setCodeMirrorSelectOptions } from "../utils";



export class CodeMirrorEditorObj implements Editor {
    initialised: boolean = false;
    type: EditorType = EditorType.CODE;
    editor: CodeMirror.Editor | null = null;
    divElem: HTMLDivElement;
    toolBarNewElems: HTMLDivElement;

    constructor(divElem: HTMLDivElement, toolBarDivElem: HTMLDivElement){
        this.divElem = divElem;
        createTextArea(divElem);
        this.toolBarNewElems = this.createExtraToolBarItems(toolBarDivElem);
        this.hide();
    }

    initialise(initialCodeStr: string){
        const config = {
            lineNumbers: true,
        }
        const textAreaElem = (document.getElementById("textAreaElem") as HTMLTextAreaElement);
        this.editor = CodeMirror.fromTextArea(textAreaElem, config);
        this.editor.setSize(null, "80vh");
        this.setEditorTheme("cobalt");
        this.setData(initialCodeStr);
        this.show();
    }

    hide(){
        // const wrapperElem = this.editor.getWrapperElement();
        // wrapperElem.hidden = true;
        this.divElem.hidden = true;
        this.toolBarNewElems.hidden = true;
    }

    show(){
        // const wrapperElem = this.editor.getWrapperElement();
        // wrapperElem.hidden = false;
        this.divElem.hidden = false;
        this.toolBarNewElems.hidden = false;
    }

    isHidden(){
        if(this.editor == null){
            return true;
        }
        const wrapperElem = this.editor.getWrapperElement();
        return wrapperElem.hidden;
    }

    isInitialised(){
        return (this.editor != null)
    }

    getData(){
        return this.editor? this.editor.getValue() : "";
    }

    setData(data: string){
        this.editor?.setValue(data);
    }

    setEditorTheme(theme: string){
        loadStyleSheet(`./codemirror/theme/${theme}.css`).then(
            () => { this.editor?.setOption("theme", theme); }, () => {alert("failed")}
        )
    }

    setEditorMode(shortmode: string){
        const mode: String = modeInfo[shortmode]["mode"];
        loadScript(`./codemirror/mode/${mode}/${mode}.js`).then(
            () => { this.editor?.setOption("mode", mode); }, () => {alert("failed")}
        )
    }

    createExtraToolBarItems(toolBarDivElem: HTMLDivElement){
        const wrapperElem = document.createElement("div");
        const newNavElem = document.createElement("div");
        newNavElem.classList.add("navbar-item");
        newNavElem.innerHTML = `
            <div class="field is-horizontal">
                <div class="field-body">
                    <div class="field">
                        <label class="label">Language Selector</label>
                        <p class="control is-expanded">
                            <span class="select is-fullwidth">
                                <select id="langSelector">
                                </select>
                            </span>
                        </p>
                    </div>
                </div>
                <div class="field-body">
                    <div class="field">
                        <label class="label">Theme Selector</label>
                        <p class="control is-expanded">
                            <span class="select is-fullwidth">
                                <select id="themeSelector">
                                </select>
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        `;
        wrapperElem.appendChild(newNavElem);
        toolBarDivElem.appendChild(wrapperElem);
        const langSelectElem = (document.getElementById("langSelector") as HTMLSelectElement);
            setCodeMirrorSelectOptions(langSelectElem);

        var self = this;
        langSelectElem.addEventListener("change", (event) => {
            const langSelect = (event.target as HTMLInputElement).value;
            console.log(langSelect, modeInfo, modeInfo[langSelect]);
            this.setEditorMode(langSelect);
        });
        return wrapperElem;
    }
}

function createTextArea(divElem: HTMLDivElement){
    divElem.innerHTML = `
        <textarea id="textAreaElem" hidden='true'></textarea>
        `;
}
