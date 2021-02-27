import { CodeMirrorEditorObj } from "./codemirroreditor";
import { TUIEditorObj } from "./tuicodeeditor";
import { SpreadsheetEditorObj } from "./spreadsheeteditor";
import { EditorType } from "../editorconfigs";

export { CodeMirrorEditorObj, TUIEditorObj, SpreadsheetEditorObj }

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

export function setEditorMode(
    allEditorObjs: Record<string, Editor>, 
    activeEditorObj: Editor | null, 
    shortEditorSelect: string, 
    initialCodeStr: string = "",
): Editor{
    if (shortEditorSelect == EditorType.MARKDOWN){   // Markdown
        var data = initialCodeStr;
        if (activeEditorObj != null && activeEditorObj.name != "tui" && initialCodeStr.length == 0){
            const currentData = hideEditorAndGetData(activeEditorObj);
            data = currentData ? currentData : initialCodeStr;
        };
        const tuiEditorObj = allEditorObjs["tui"]
        if (!tuiEditorObj.isInitialised()){
            tuiEditorObj.initialise(data);
        }
        tuiEditorObj.show();
        tuiEditorObj.setData(data);
        return tuiEditorObj;
    } else if (shortEditorSelect == EditorType.SPREADSHEET){
        var data = initialCodeStr;
        if (activeEditorObj != null && activeEditorObj.name != "spreadsheet" && initialCodeStr.length == 0){
            const currentData = hideEditorAndGetData(activeEditorObj);
            data = currentData ? currentData : initialCodeStr
        }
        const spreadsheetEditorObj = allEditorObjs["spreadsheet"];
        if (!spreadsheetEditorObj.isInitialised()){
            spreadsheetEditorObj.initialise(data);
        }
        spreadsheetEditorObj.show();
        spreadsheetEditorObj.setData(data);
        return spreadsheetEditorObj;
        // const tuiCalendarObj = allEditorObjs["tuical"]
        // if (!tuiCalendarObj.isInitialised()){
        //     tuiCalendarObj.initialise(initialCodeStr);
        // }
        // tuiCalendarObj.show();
        // return tuiCalendarObj;
        
    } else if (shortEditorSelect == EditorType.CODE){
        var data = initialCodeStr;
        if (activeEditorObj != null && activeEditorObj.name != "codemirror" && initialCodeStr.length == 0){
            data = hideEditorAndGetData(activeEditorObj)
        };
        const codeMirrorEditorObj: CodeMirrorEditorObj = (allEditorObjs["codemirror"] as CodeMirrorEditorObj);
        if (!codeMirrorEditorObj.isInitialised()){
            codeMirrorEditorObj.initialise(initialCodeStr);
        } else {
            if (codeMirrorEditorObj.isHidden()){
                codeMirrorEditorObj.show();
            }
        }
        if (data.length > 0){
            codeMirrorEditorObj.setData(data);
        }
        // codeMirrorEditorObj.setEditorMode(shortEditorSelect);
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