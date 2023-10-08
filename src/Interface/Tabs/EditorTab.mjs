import "./EditorTab.css";
import Tab from "./Tab.mjs";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import Split from "split-grid";

export default class EditorTab extends Tab{
  constructor(Button, Body){
    super(Button, Body);
    this.Editor = Monaco.editor.create(this.Body.querySelector(".Editor"), {
      "value": `
      lea R1,123[R2]
      add R2,R1,R2
      add R3,R1,R2
      jump 2
      `,
      "theme": "vs-dark",
      //"language": "javascript",
      "automaticLayout": true,
      "fontSize": 18,
      /*//https://stackoverflow.com/a/65222640
      "lineNumbers": a => a - 4 + "",
      "lineNumbersMinChars": 2,
      "glyphMargin": false,
      "readOnly": true*/
    });
    console.log(this.Editor);

    document.addEventListener("keydown", function(Event){
      if(Event.ctrlKey && Event.key === "s"){
        Event.preventDefault();
        this.Download();
      }
    }.bind(this));
    this.Body.querySelector(".Editor").addEventListener("drop", async function(Event){
      Event.preventDefault();
      if(Event.dataTransfer.items){
        if(Event.dataTransfer.items.length !== 1) console.error("Can only upload one file.");
        const [item] = Event.dataTransfer.items;
        if(item.kind === "file"){
          const text = await item.getAsFile().text();
          this.SetText(text);
        }
      } else if(Event.dataTransfer.files){
        if(Event.dataTransfer.files.length !== 1) console.error("Can only upload one file.");
        const [item] = Event.dataTransfer.items;
        const text = await item.getAsFile().text();
        this.SetText(text);
      }
    }.bind(this));
  }
  GetText(){
    return this.Editor.getModel().getValue();
  }
  SetText(Text){
    this.Editor.getModel().setValue(Text);
  }
  Download(){
    const file = new Blob([this.GetText()], {"type": "text/plain"});
    const element = document.createElement("a");
    const url = URL.createObjectURL(file);
    element.href = url;
    element.download = `${(new Date).toISOString()}.txt`;
    element.click();
  }
};