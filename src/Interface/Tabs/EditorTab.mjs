import "./EditorTab.css";
import Tab from "./Tab.mjs";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import Split from "split-grid";
import HexLineNumbers from "../HexLineNumbers.mjs";
import Decompile from "../../Interpreter/Decompile.mjs";

const InstructionDocs = new Map([
  ["add", [
    "`add`: Add",
    "Adds the values of two registers.",
    "Syntax: `add Rd,Ra,Rb`"
  ]],
  ["sub", [
    "`sub`: Subtract",
    "Subtracts the values of two registers.",
    "Syntax: `sub Rd,Ra,Rb`"
  ]],
  ["mul", [
    "`mul`: Multiply",
    "Multiplies the values of two registers.",
    "Syntax: `mul Rd,Ra,Rb`"
  ]],
  ["div", [
    "`div`: Unsigned division",
    "Performs unsigned division of the values of two registers and sets the result to Rd. Also calculates the remainder of the division and sets the result to R15.",
    "Syntax: `div Rd,Ra,Rb`"
  ]],
  ["cmp", [
    "`cmp`: Compare",
    "Compares the values of two registers and stores the result in R15.",
    "Syntax: `cmp Ra,Rb`"
  ]],
  ["addc", [
    "`addc`: Add Carry",
    "Adds the values of two registers and the carry bit of R15.",
    "Syntax: `addc Rd,Ra,Rb`"
  ]],
  ["muln", [
    "`muln`: Augmented Multiplication",
    "Multiplies the values of two registers. Sets the lower 16 bits to Rd, and the higher 16 bits to R15.",
    "Syntax: `muln Rd,Ra,Rb`"
  ]],
  ["divn", [
    "`div`: Extended Division",
    "Performs the division of a 32-bit number by a 16-bit quotient. See the docs for more information.",
    "Syntax: `divn Rd,Ra,Rb`"
  ]],
  ["trap", [
    "`trap`: Trap",
    [
      "Performs a special operation determined by the value stored in memory at address Rd. See the docs for more information on this. The other two registers are ignored.",
      "The most common use is to halt execution of the program, which is code 0. This can be done with `trap R0,R0,R0`."
    ].join("\n\n"),
    "Syntax: `divn Rd,Ra,Rb`"
  ]],
  ["lea", [
    "`lea`: Load Effective Address",
    [
      "Sets Rd to the effective address of the instruction.",
      "The most common use is to load a compile-time constant value into the destination register."
    ].join("\n\n"),
    "Syntax: `lea Rd,Offset[Ra]`"
  ]],
  ["load", [
    "`load`: Load",
    "Loads a value from memory at the effective address and sets the value to Rd.",
    "Syntax: `load Rd,Offset[Ra]`"
  ]],
  ["store", [
    "`store`: Store",
    "Stores the value of Rd to the memory at the effective address.",
    "Syntax: `store Rd,Offset[Ra]`"
  ]],
  ["jump", [
    "`jump`: Jump",
    "Performs an unconditional jump to the effective address.",
    "Syntax: `jump Offset[Ra]`"
  ]],
  ["jumpc0", [
    "`jumpc0`: Jump Conditionally if Zero",
    "Jumps to the effective address only if the provided bit of R15 is set to zero.",
    "Syntax: `jumpc0 Bit,Offset[Ra]`"
  ]],
  ["jumpc1", [
    "`jumpc1`: Jump Conditionally if One",
    "Jumps to the effective address only if the provided bit of R15 is set to one.",
    "Syntax: `jumpc1 Bit,Offset[Ra]`"
  ]],
  ["jal", [
    "`jal`: Jump And Link",
    "Sets Rd to the current value of the program counter, and then performs an unconditional jump to the effective address.",
    "Syntax: `jal Rd,Offset[Ra]`"
  ]],
  ["tstset", [
    "`tstset`: Test Set",
    "Does nothing.",
    "Syntax: `tstset Rd,Offset[Ra]`"
  ]],
]);

// Register a new language
Monaco.languages.register({ id: "Sigma16" });

// Register a tokens provider for the language
Monaco.languages.setMonarchTokensProvider("Sigma16", {
	tokenizer: {
		root: [
      [/^[a-zA-Z]+/, "Label"],
			[/ +[a-z]+/, "Instruction"],
			[/R((0[0-9]+)|([1-9][0-9][0-9]+)|(1[6-9])|([2-9][0-9]))/, "BadRegister"],
			[/R((1[0-5]?)|[02-9])/, "Register"],
			[/[\[\]]/, "Bracket"],
			[/(-?(0|([1-9][0-9]*)))|(\$[0-9a-fA-F]+)/, "Number"],
			[/;.*/, "Comment"],
		],
	},
});

Monaco.languages.registerHoverProvider("Sigma16", {
	provideHover: function (Model, Position) {
    const Instruction = Model.getWordAtPosition(Position)?.word;
    console.log(Instruction);
    if(InstructionDocs.has(Instruction)){
      return {
        "contents": InstructionDocs.get(Instruction).map(value => ({value}))
      };
    } else return {};
	},
});

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
      "foreground": "a4db00",
      "token": "Instruction"
    },
    {
      "foreground": "2596be",
      "token": "Label"
    },
    {
      "foreground": "179fff",
      "token": "Register"
    },
    {
      "foreground": "db0000",
      "token": "BadRegister"
    },
    {
      "foreground": "fbde2d",
      "token": "Bracket"
    },
    {
      "foreground": "00dbdb",
      "token": "Number"
    },
    {
      "foreground": "afafaf",
      "token": "Comment"
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


//https://stackoverflow.com/questions/73581314/add-line-bookmarks-to-monaco-editor

//Add:   9992000000 / 84228862
//Sub:  10584000000 / 84529669
//Mul:  19869000000 / 83663824
//Div:   8805000000 / 77816196
//Cmp:  14264000000 / 77893285
//Addc: 10220000000 / 84763490
//Muln: 21255000000 / 82127778
//Jump: 12085000000 / 68068057
//Lea:  14215000000 / 65743919
//Load: 14069000000 / 66939238
//Store:14042000000 / 63713407
export default class EditorTab extends Tab{
  constructor(Button, Body){
    super(Button, Body);
    this.GetHexLineNumber = HexLineNumbers(this.GetText.bind(this));
    this.Decompile = Decompile;
    this.Editor = Monaco.editor.create(this.Body.querySelector(".Editor"), {
      "value": `;;Test instruction
  lea R1,123[R0]
  add R1,R1,R1
  add R1,R1,R1
  add R1,R1,R1
  add R1,R1,R1
  add R1,R1,R1
  add R1,R1,R1
  add R1,R1,R1
  add R1,R1,R1
  jump 2`,
      "theme": "Test",
      "language": "Sigma16",
      "automaticLayout": true,
      "fontSize": 18,
      "glyphMargin": true,
      "background": "#4f4f4fbf",
      ////https://stackoverflow.com/a/65222640
      "lineNumbers": a => "0x" + this.GetHexLineNumber(a - 1).toString(16).padStart(4, "0"),
      //"lineNumbersMinChars": 2,
      //"glyphMargin": false,
      //"readOnly": true
    });

    //Could be used for drawing breakpoint arrows
        /*this.Decorations = this.Editor.createDecorationsCollection([
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
    ]);*/


    //console.log(this.Editor);
    

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