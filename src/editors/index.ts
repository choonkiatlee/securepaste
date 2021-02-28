import { CodeMirrorEditorObj } from "./codemirroreditor";
import { TUIEditorObj } from "./tuicodeeditor";
import { SpreadsheetEditorObj } from "./spreadsheeteditor";
import { EditorType } from "./editorconfigs";

export { CodeMirrorEditorObj, TUIEditorObj, SpreadsheetEditorObj }

export interface Editor {
    type: EditorType;
    initialise: (initialCodeStr:string) => void;
    hide: () => void;
    show: () => void;
    isHidden: () => boolean;
    isInitialised: () => boolean;
    getData: () => string;
    setData: (data: string) => void;
}

export function setEditorMode(
    allEditorObjs: { [key in EditorType]: Editor}, 
    activeEditorObj: Editor | null, 
    shortEditorSelect: EditorType, 
    initialCodeStr: string = "",
): Editor{
    var data = initialCodeStr;
    if (activeEditorObj != null && activeEditorObj.type != shortEditorSelect && initialCodeStr.length == 0){
        const currentData = hideEditorAndGetData(activeEditorObj);
        data = currentData ? currentData : initialCodeStr;
    }
    const newEditorObj = allEditorObjs[shortEditorSelect];
    if (!newEditorObj.isInitialised()){
        newEditorObj.initialise(data);
    }
    newEditorObj.show();
    newEditorObj.setData(data);
    return newEditorObj;
}

function hideEditorAndGetData(editorObj: Editor){
    var data = "";
    if (!(editorObj.isInitialised() && editorObj.isHidden())){
        editorObj.hide();
        data = editorObj.getData();
    };
    return data;
}

