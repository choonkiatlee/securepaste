import { Editor } from "../editors";
import { loadStyleSheet, loadScript } from "../utils";
import CodeMirror from "codemirror";
import { modeInfo } from "../editorconfigs";



export class CodeMirrorEditorObj implements Editor {
    initialised: boolean = false;
    name: string = "codemirror";
    editor: CodeMirror.Editor | null = null;
    textAreaElem: HTMLTextAreaElement;

    constructor(textAreaElem: HTMLTextAreaElement){
        this.textAreaElem = textAreaElem;
    }

    initialise(initialCodeStr: string){
        const config = {
            lineNumbers: true,
        }
        this.editor = CodeMirror.fromTextArea(this.textAreaElem, config);
        this.setEditorTheme("cobalt");
        this.setData(initialCodeStr);
        // (document.getElementsByClassName('CodeMirror')[0] as HTMLElement).style.height = "100%";
    }

    hide(){
        if(this.editor == null){
            throw new Error("Editor Not Initialised Yet.")
        }
        const wrapperElem = this.editor.getWrapperElement();
        wrapperElem.hidden = true;
    }

    show(){
        if(this.editor == null){
            throw new Error("Editor Not Initialised Yet.")
        }
        const wrapperElem = this.editor.getWrapperElement();
        wrapperElem.hidden = false;
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
        loadStyleSheet(`codemirror/theme/${theme}.css`).then(
            () => { this.editor?.setOption("theme", theme); }, () => {alert("failed")}
        )
    }

    setEditorMode(shortmode: string){
        const mode: String = modeInfo[shortmode]["mode"];
        loadScript(`codemirror/mode/${mode}/${mode}.js`).then(
            () => { this.editor?.setOption("mode", mode); }, () => {alert("failed")}
        )
    }
}