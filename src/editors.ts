import Codemirror from "codemirror";
import { loadStyleSheet, loadScript } from "./utils";
import { modeInfo } from "./editorconfigs";
import toastuiEditor from "@toast-ui/editor";
import toastuiSyntaxHighlightPlugin from "@toast-ui/editor-plugin-code-syntax-highlight"
import {registerTUIKatexBtn, katexPlugin } from "./katexPlugin";

export interface Editor {
    name: string;
    initialise: (initialCodeStr:string) => void;
    hide: () => void;
    show: () => void;
    isHidden: () => boolean;
    isInitialised: () => boolean;
    getData: () => string;
    setData: (data: string) => void;
}

export class CodeMirrorEditorObj implements Editor {
    initialised: boolean = false;
    name: string = "codemirror";
    editor: Codemirror.Editor | null = null;
    textAreaElem: HTMLTextAreaElement;

    constructor(textAreaElem: HTMLTextAreaElement){
        this.textAreaElem = textAreaElem;
    }

    initialise(initialCodeStr: string){
        const config = {
            lineNumbers: true,
        }
        this.editor = Codemirror.fromTextArea(this.textAreaElem, config);
        this.setEditorTheme("cobalt");
        this.setData(initialCodeStr);
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

export class TUIEditorObj implements Editor {
    tuiDivElem: HTMLDivElement;
    name: string = "tui";
    editor: toastuiEditor | null = null;

    constructor(tuiDivElem: HTMLDivElement){
        this.tuiDivElem = tuiDivElem;
    }

    initialise(initialCodeStr: string){
        const Editor = toastui.Editor;
        // const syntaxHighlightPlugin = toastui.Editor.plugin["codeSyntaxHighlight"];
        console.log(katexPlugin)
        const editor = new toastuiEditor({
            el: this.tuiDivElem,
            height: '500px',
            initialEditType: 'markdown',
            previewStyle: 'vertical',
            usageStatistics: false,
            plugins: [],
        });
        // registerTUIKatexBtn(editor);
        editor.setMarkdown(initialCodeStr);
        this.editor = editor;
    }

    hide(){
        if (this.editor == null){
            throw new Error("Editor not initialised")
        }
        this.editor.hide();
        this.editor.getUI()._container.hidden = true;
    }

    show(){
        if (this.editor == null){
            this.initialise("");
        }
        if (this.editor == null){
            throw new Error("Editor is not initialised"); // Only here to please TS
        }
        this.editor.show();
        this.editor.getUI()._container.hidden = false;
    }

    isHidden(){
        if (this.editor == null)
            return true;
        return this.editor.getUI()._container.hidden;
    }

    isInitialised(){
        return (this.editor != null)
    }

    getData(){
        return this.editor? this.editor.getMarkdown() : "";
    }

    setData(data: string){
        return this.editor?.setMarkdown(data);
    }
}

export function setEditorMode(
    allEditorObjs: Record<string, Editor>, 
    activeEditorObj: Editor | null, 
    shortmode: string, 
    initialCodeStr: string,
){
    if (shortmode == "Ce"){   // Markdown
        var data = initialCodeStr;
        if (activeEditorObj != undefined && activeEditorObj.name != "tui"){
            data = hideEditorAndGetData(activeEditorObj)
        };
        const tuiEditorObj = allEditorObjs["tui"]
        if (!tuiEditorObj.isInitialised()){
            tuiEditorObj.initialise(initialCodeStr);
        }
        tuiEditorObj.show();
        tuiEditorObj.setData(data);
        return tuiEditorObj;
    } else if (shortmode != "Ce"){
        var data = initialCodeStr;
        if (activeEditorObj != undefined && activeEditorObj.name != "codemirror"){
            data = hideEditorAndGetData(activeEditorObj)
        };
        const codeMirrorEditorObj: CodeMirrorEditorObj = (allEditorObjs["codemirror"] as CodeMirrorEditorObj);
        console.log(codeMirrorEditorObj);
        if (!codeMirrorEditorObj.isInitialised()){
            console.log("initialsing...");
            codeMirrorEditorObj.initialise(initialCodeStr);
            console.log("initialising...")
        } else {
            if (codeMirrorEditorObj.isHidden()){
                codeMirrorEditorObj.show();
                codeMirrorEditorObj.setData(data);
            }
        }
        codeMirrorEditorObj.setEditorMode(shortmode);
        return codeMirrorEditorObj;
    } else {
        throw new Error("No Active Editor Object")
    }
    
}

function hideEditorAndGetData(editorObj: Editor){
    var data = "";
    if (!(editorObj.isInitialised() && editorObj.isHidden())){
        editorObj.hide();
        data = editorObj.getData();
    };
    return data;
}