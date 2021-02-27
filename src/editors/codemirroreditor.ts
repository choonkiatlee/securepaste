import { Editor } from "../editors";
import { loadStyleSheet, loadScript, setEditorSelectOptions } from "../utils";
import CodeMirror from "codemirror";
import { modeInfo } from "../editorconfigs";
import { setCodeMirrorSelectOptions } from "../utils";



export class CodeMirrorEditorObj implements Editor {
    initialised: boolean = false;
    name: string = "codemirror";
    editor: CodeMirror.Editor | null = null;
    divElem: HTMLDivElement;

    constructor(divElem: HTMLDivElement){
        this.divElem = divElem;
        this.createModeSelector();
        this.divElem.hidden = true;
    }

    initialise(initialCodeStr: string){
        const config = {
            lineNumbers: true,
        }
        const textAreaElem = (document.getElementById("textAreaElem") as HTMLTextAreaElement);
        this.editor = CodeMirror.fromTextArea(textAreaElem, config);
        this.setEditorTheme("cobalt");
        this.setData(initialCodeStr);
        this.show();
        // (document.getElementsByClassName('CodeMirror')[0] as HTMLElement).style.height = "100%";
    }

    hide(){
        if(this.editor == null){
            throw new Error("Editor Not Initialised Yet.")
        }
        // const wrapperElem = this.editor.getWrapperElement();
        // wrapperElem.hidden = true;
        this.divElem.hidden = true;
    }

    show(){
        if(this.editor == null){
            throw new Error("Editor Not Initialised Yet.")
        }
        // const wrapperElem = this.editor.getWrapperElement();
        // wrapperElem.hidden = false;
        this.divElem.hidden = false;
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

    createModeSelector(){
        this.divElem.innerHTML = `
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
        </div>
        <textarea id="textAreaElem" hidden='true'></textarea>
        `;
        const langSelectElem = (document.getElementById("langSelector") as HTMLSelectElement);
        setCodeMirrorSelectOptions(langSelectElem);
        
        var self = this;
        langSelectElem.addEventListener("change", (event) => {
            const langSelect = (event.target as HTMLInputElement).value;
            console.log(langSelect, modeInfo, modeInfo[langSelect]);
            this.setEditorMode(langSelect);
        });      
        
    }
}
