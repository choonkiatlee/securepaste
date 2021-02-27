import { Editor } from "../editors";
import { loadStyleSheet, loadScript, isSmallScreen } from "../utils";
import { modeInfo } from "../editorconfigs";
import toastuiEditor from "@toast-ui/editor";
import {registerTUIKatexBtn, katexPlugin } from "./katexPlugin";

export class TUIEditorObj implements Editor {
    tuiDivElem: HTMLDivElement;
    name: string = "tui";
    editor: toastui.Editor | null = null;

    constructor(tuiDivElem: HTMLDivElement){
        this.tuiDivElem = tuiDivElem;
    }

    initialise(initialCodeStr: string){
        const Editor = toastui.Editor;
        debugger;
        const syntaxHighlightPlugin = toastui.Editor.plugin["codeSyntaxHighlight"];
        const katexPluginLoaded = katexPlugin();
        const editor = new Editor({
            el: this.tuiDivElem,
            height: '500px',
            initialEditType: isSmallScreen() ? 'wysiwyg' : 'markdown',
            previewStyle: 'vertical',
            usageStatistics: false,
            plugins: [syntaxHighlightPlugin, katexPluginLoaded],
        });
        registerTUIKatexBtn(editor);
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