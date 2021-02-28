import { Editor } from "./index";
import Spreadsheet, { Options } from "x-data-spreadsheet";
import { EditorType } from "./editorconfigs";


export class SpreadsheetEditorObj implements Editor {
    spreadsheetDivElem: HTMLElement;
    type: EditorType = EditorType.SPREADSHEET;
    spreadsheet: Spreadsheet | null = null;

    constructor(spreadsheetDivElem: HTMLElement){
        this.spreadsheetDivElem = spreadsheetDivElem;
    }

    initialise(initialCodeStr: string){
        const options: Options = {
            view: {
                width: () => Number(document.documentElement.clientWidth * 0.90),
                height: () => Number(document.documentElement.clientHeight * 0.8),
            }
        }
        const spreadsheet = new Spreadsheet(this.spreadsheetDivElem, options);
        this.spreadsheet = spreadsheet;
        this.setData(initialCodeStr);
    }

    hide(){
        if (!this.isInitialised()){
            throw new Error("Editor not initialised")
        }
        this.spreadsheetDivElem.hidden = true
    }

    show(){
        if (!this.isInitialised()){
            this.initialise("");
        }
        if (!this.isInitialised()){
            throw new Error("Editor is not initialised"); // Only here to please TS
        }
        this.spreadsheetDivElem.hidden = false
    }

    isHidden(){
        if (!this.isInitialised())
            return true;
        return this.spreadsheetDivElem.hidden;
    }

    isInitialised(){
        return (this.spreadsheet != null)
    }

    getData(){
        const data = this.spreadsheet?.getData();
        const datastr = JSON.stringify(data);
        console.log(datastr, data);
        return datastr;
    }

    setData(data: string){
        let spreadsheetData;
        try{
            spreadsheetData = JSON.parse(data);
        } catch {
            spreadsheetData = {};
        }
        
        console.log(data, spreadsheetData);
        this.spreadsheet?.loadData(spreadsheetData);
    }
}
