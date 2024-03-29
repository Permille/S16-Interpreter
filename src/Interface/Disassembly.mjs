import Decompile from "../Interpreter/Decompile.mjs";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api.js";
export default class Disassembly{
  constructor(RootElement){
    this.RootElement = RootElement;
    this.EditorElement = document.createElement("div");
    this.EditorElement.style.width = "100%";
    //this.EditorElement.style.height = "100%";
    this.EditorElement.style.maxHeight = "100%";
    this.EditorElement.style.flexGrow = "1";
    RootElement.append(this.EditorElement);
    this.MemorySegmentView = new Uint16Array(0);
    this.MemorySegmentViewOffset = 0;
    this.CurrentMemorySegmentViewOffset = 0;

    const ButtonsWrapper = document.querySelector("#DisassemblyButtonsWrapper");
    const Refresh = ButtonsWrapper.querySelector(".Refresh");

    Refresh.addEventListener("click", this.TriggerUpdate.bind(this));

    this.Editor = Monaco.editor.create(this.EditorElement, {
      "value": ";;Disassembled output will be shown here upon refreshing.",
      "theme": "Test",
      "language": "Sigma16",
      "automaticLayout": true,
      "fontSize": 18,
      "glyphMargin": true,
      "background": "#4f4f4fbf",
      ////https://stackoverflow.com/a/65222640
      "lineNumbers": a => "0x" + (this.CurrentMemorySegmentViewOffset + a - 1).toString(16).padStart(4, "0"),
      "readOnly": true
    });
    this.Decorations = this.Editor.createDecorationsCollection([
      {
        range: new Monaco.Range(3, 1, 3, 1),
        options: {
          isWholeLine: true,
          //className: "myContentClass",
          //glyphMarginClassName: "myGlyphMarginClass",
          //minimap: true,
          //before: "Hello",
          //afterContentClassName: "Test"
          marginClassName: "Breakpoint",
          "minimap": {
            "color": "rgb(2, 99, 173)",
            "darkColor": "rgb(2, 99, 173)",
            "position": 1 //Inline
          }
        },
      },
    ]);
  }
  UpdateMemory(MemoryArray, Offset){
    this.MemorySegmentView = MemoryArray;
    this.CurrentMemorySegmentViewOffset = Offset;
    const Disassembly = Decompile(this.MemorySegmentView);
    this.Editor.setValue(Disassembly.join("\n"));
  }
  async TriggerUpdate(){
    const Offset = this.MemorySegmentViewOffset;
    const Response = await window.Main.Interpreter.MessageWorker("GetMemoryArray", {
      "Min": Offset,
      "Max": Offset + 1024
    });
    this.UpdateMemory(Response.data.MemoryArray, Offset);
    const Line = (await window.Main.Interpreter.MessageWorker("GetCurrentProgramCounter")).data.Line;
    this.Editor.createDecorationsCollection([
      {
        range: new Monaco.Range(Line + 1, 1, Line + 1, 1),
        options: {
          isWholeLine: true,
          //className: "myContentClass",
          //glyphMarginClassName: "myGlyphMarginClass",
          //minimap: true,
          //before: "Hello",
          //afterContentClassName: "Test"
          marginClassName: "Breakpoint",
          blockClassName: "LineBreakpoint",
          "minimap": {
            "color": "rgb(2, 99, 173)",
            "darkColor": "rgb(2, 99, 173)",
            "position": 1 //Inline
          }
        },
      },
    ]);
  }
  ReplaceContents(Value){
    this.Editor.setValue(Value);
  }
};