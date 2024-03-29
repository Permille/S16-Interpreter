import "./InterpreterTab.css";
import Tab from "./Tab.mjs";
import Disassembly from "../Disassembly.mjs";
import AdvancedSettingsWindow from "../Windows/AdvancedSettingsWindow.mjs";

export default class InterpreterTab extends Tab{
  constructor(Button, Body){
    super(Button, Body);
    this.IsRunning = false;
    this.YieldInterval = 1000000;
    this.CompileButton = this.Body.querySelector(".CompileButton");
    //this.ResetButton = this.Body.querySelector(".ResetButton");
    this.RunButton = this.Body.querySelector(".RunButton");
    this.StepButton = this.Body.querySelector(".StepButton");
    this.AdvancedSettingsButton = this.Body.querySelector(".AdvancedSettingsButton");

    this.StateElement = document.getElementById("InterpreterStateSummaryState");
    this.ProgramCounterElement = document.getElementById("InterpreterStateSummaryProgramCounter");
    this.InstructionsRunElement = document.getElementById("InterpreterStateSummaryInstructionsRun");
    this.InterpreterOutputElement = document.getElementById("InterpreterOutput");
    this.InterpreterInputElement = document.getElementById("InterpreterInput");

    this.CompileButton.addEventListener("click", async function(){
      this.StateElement.innerText = "Resetting";
      await window.Main.Interpreter.Reset();
      this.RunButton.classList.remove("NotClickable");
      this.StepButton.classList.remove("NotClickable");
      this.InterpreterOutputElement.innerText = ""; //Clear output buffer
      //The original implementation does not clear the input buffer...
      this.StateElement.innerText = "Stopped";
      window.Main.Interpreter.Compile(window.Main.Interface.Tabs.get("Editor").GetText());
      this.Disassembly.TriggerUpdate();
    }.bind(this));
    /*this.ResetButton.addEventListener("click", async function(){
      await window.Main.Interpreter.Reset();
    }.bind(this));*/
    this.RunButton.addEventListener("click", async function(){
      if(!this.IsRunning){
        this.IsRunning = true;
        this.StateElement.innerText = "Running";
        this.RunButton.innerText = "Stop";
        this.Disassembly.ReplaceContents(";; Disassembly cannot be shown\n;; because the program is running.");
        await window.Main.Interpreter.Run(this.YieldInterval);
      } else{
        this.IsRunning = false;
        this.StateElement.innerText = "Stopped";
        this.RunButton.innerText = "Run";
        this.Disassembly.TriggerUpdate();
      }
    }.bind(this));
    this.StepButton.addEventListener("click", async function(){
      await window.Main.Interpreter.Run(1);
      this.Disassembly.TriggerUpdate();
    }.bind(this));
    this.AdvancedSettingsButton.addEventListener("click", function(){
      new AdvancedSettingsWindow;
    }.bind(this));
    
    void async function Load(){
      await window.LoadedPromise;
      window.Main.Interpreter.Events.addEventListener("Yield", function(){
        if(this.IsRunning) window.Main.Interpreter.Run(this.YieldInterval);
      }.bind(this));
      window.Main.Interpreter.Events.addEventListener("Error", function(){
        this.IsRunning = false;
        this.StateElement.innerText = "Errored";
        this.RunButton.innerText = "Run";
        this.RunButton.classList.add("NotClickable");
        this.StepButton.classList.add("NotClickable");
      }.bind(this));
      window.Main.Interpreter.Events.addEventListener("Stop", function(){
        this.StateElement.innerText = "Exited";
        this.RunButton.innerText = "Run";
        this.RunButton.classList.add("NotClickable");
        this.StepButton.classList.add("NotClickable");
        this.IsRunning = false;
        this.Disassembly.TriggerUpdate();
      }.bind(this));
      window.Main.Interpreter.Events.addEventListener("Breakpoint", function(){
        this.StateElement.innerText = "Breakpoint";
        this.RunButton.innerText = "Run";
        this.IsRunning = false;
        this.Disassembly.TriggerUpdate();
      }.bind(this));

      window.Main.Interpreter.Events.addEventListener("Output", function(Message){
        this.InterpreterOutputElement.innerText += Message.detail;
      }.bind(this));
    
      void async function Frame(){
        const State = await window.Main.Interpreter.MessageWorker("GetStateSummary");

        this.ProgramCounterElement.innerText = State.data.ProgramCounter;
        this.InstructionsRunElement.innerText = State.data.InstructionsRun;

        window.requestAnimationFrame(Frame.bind(this));
      }.call(this);
    }.call(this);

    this.Disassembly = new Disassembly(this.Body.querySelector(".Disassembly"));

    void async function Load(){
      await window.LoadedPromise;
      this.Disassembly.TriggerUpdate();
    }.call(this);
  }
  SetInputBuffer(Value){
    if(Value !== this.InterpreterInputElement.value) this.InterpreterInputElement.value = Value;
  }
};