import "./EditorTab.css";
import Tab from "./Tab.mjs";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import Split from "split-grid";

//https://bitwiser.in/monaco-themes/
Monaco.editor.defineTheme("Test", {
  "base": "vs-dark",
  "inherit": true,
  "rules": [
    {
      "background": "0f0f0faf",
      "token": ""
    },
    {
      "foreground": "aeaeae",
      "token": "comment"
    },
    {
      "foreground": "d8fa3c",
      "token": "constant"
    },
    {
      "foreground": "ff6400",
      "token": "entity"
    },
    {
      "foreground": "fbde2d",
      "token": "keyword"
    },
    {
      "foreground": "fbde2d",
      "token": "storage"
    },
    {
      "foreground": "61ce3c",
      "token": "string"
    },
    {
      "foreground": "61ce3c",
      "token": "meta.verbatim"
    },
    {
      "foreground": "8da6ce",
      "token": "support"
    },
    {
      "foreground": "ab2a1d",
      "fontStyle": "italic",
      "token": "invalid.deprecated"
    },
    {
      "foreground": "f8f8f8",
      "background": "9d1e15",
      "token": "invalid.illegal"
    },
    {
      "foreground": "ff6400",
      "fontStyle": "italic",
      "token": "entity.other.inherited-class"
    },
    {
      "foreground": "ff6400",
      "token": "string constant.other.placeholder"
    },
    {
      "foreground": "becde6",
      "token": "meta.function-call.py"
    },
    {
      "foreground": "7f90aa",
      "token": "meta.tag"
    },
    {
      "foreground": "7f90aa",
      "token": "meta.tag entity"
    },
    {
      "foreground": "ffffff",
      "token": "entity.name.section"
    },
    {
      "foreground": "d5e0f3",
      "token": "keyword.type.variant"
    },
    {
      "foreground": "f8f8f8",
      "token": "source.ocaml keyword.operator.symbol"
    },
    {
      "foreground": "8da6ce",
      "token": "source.ocaml keyword.operator.symbol.infix"
    },
    {
      "foreground": "8da6ce",
      "token": "source.ocaml keyword.operator.symbol.prefix"
    },
    {
      "fontStyle": "underline",
      "token": "source.ocaml keyword.operator.symbol.infix.floating-point"
    },
    {
      "fontStyle": "underline",
      "token": "source.ocaml keyword.operator.symbol.prefix.floating-point"
    },
    {
      "fontStyle": "underline",
      "token": "source.ocaml constant.numeric.floating-point"
    },
    {
      "background": "ffffff08",
      "token": "text.tex.latex meta.function.environment"
    },
    {
      "background": "7a96fa08",
      "token": "text.tex.latex meta.function.environment meta.function.environment"
    },
    {
      "foreground": "fbde2d",
      "token": "text.tex.latex support.function"
    },
    {
      "foreground": "ffffff",
      "token": "source.plist string.unquoted"
    },
    {
      "foreground": "ffffff",
      "token": "source.plist keyword.operator"
    }
  ],
  "colors": {
    "editor.foreground": "#F8F8F8",
    "editor.background": "#0f0f0faf",
    "editor.selectionBackground": "#253B76",
    "editor.lineHighlightBackground": "#FFFFFF0F",
    "editorCursor.foreground": "#FFFFFFA6",
    "editorWhitespace.foreground": "#FFFFFF40"
  }
});

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
      "theme": "Test",
      //"language": "javascript",
      "automaticLayout": true,
      "fontSize": 18,
      "background": "#4f4f4fbf"
      ////https://stackoverflow.com/a/65222640
      //"lineNumbers": a => a - 4 + "",
      //"lineNumbersMinChars": 2,
      //"glyphMargin": false,
      //"readOnly": true
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