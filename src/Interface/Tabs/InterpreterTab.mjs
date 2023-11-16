import "./InterpreterTab.css";
import Tab from "./Tab.mjs";
import MemoryViewer from "../MemoryViewer.mjs";

export default class InterpreterTab extends Tab{
  constructor(Button, Body){
    super(Button, Body);
    this.IsRunning = false;
    this.CompileButton = this.Body.querySelector(".CompileButton");
    this.ResetButton = this.Body.querySelector(".ResetButton");
    this.RunButton = this.Body.querySelector(".RunButton");
    this.StepButton = this.Body.querySelector(".StepButton");
    this.CompileButton.addEventListener("click", function(){
      window.Main.Interpreter.Compile(window.Main.Interface.Tabs.get("Editor").GetText());
    }.bind(this));
    this.ResetButton.addEventListener("click", async function(){
      await window.Main.Interpreter.Reset();
    }.bind(this));
    this.RunButton.addEventListener("click", async function(){
      if(!this.IsRunning){
        this.IsRunning = true;
        this.RunButton.innerText = "Stop";
        await window.Main.Interpreter.Run(1000000);
      } else{
        this.IsRunning = false;
        this.RunButton.innerText = "Run";
      }
    }.bind(this));
    this.StepButton.addEventListener("click", async function(){
      await window.Main.Interpreter.Run(1);
    }.bind(this));
    
    void async function Load(){
      await window.LoadedPromise;
      window.Main.Interpreter.Events.addEventListener("Yield", function(){
        if(this.IsRunning) window.Main.Interpreter.Run(1000000);
      }.bind(this));
      window.Main.Interpreter.Events.addEventListener("Error", function(){
        this.IsRunning = false;
        this.RunButton.innerText = "Run";
      }.bind(this));
      window.Main.Interpreter.Events.addEventListener("Stop", console.log.bind(null, "Stopped"));
      window.Main.Interpreter.Events.addEventListener("Breakpoint", console.log.bind(null, "Reached Breakpoint"));
    }.call(this);

    this.RegisterValueElements = [];
    const RegistersWrapperElement = this.Body.querySelector(".RegistersList");
    for(let i = 0; i < 2; ++i){
      const HalfElement = document.createElement("div");
      RegistersWrapperElement.append(HalfElement);
      for(let j = i * 8; j < i * 8 + 8; ++j){
        const RegisterElement = document.createElement("div");
        HalfElement.append(RegisterElement);
        const RegisterIDElement = document.createElement("p");
        const RegisterValueElement = document.createElement("p");
        RegisterIDElement.innerText = "R" + j;
        RegisterValueElement.innerText = Math.floor(Math.random() * 65535 - 32768);
        RegisterElement.append(RegisterIDElement);
        RegisterElement.append(RegisterValueElement);
        this.RegisterValueElements.push(RegisterValueElement);
      }
    }
    this.MemoryViewer = new MemoryViewer(this.Body.querySelector(".MemoryView"));

    
    this.ReceivedMemoryUpdate = false;

    void async function Load(){
      await window.LoadedPromise;
      const Response = await window.Main.Interpreter.MessageWorker("GetMemoryArray", {
        "Min": this.MemoryViewer.MemoryMin + 0,
        "Max": this.MemoryViewer.MemoryMin + 160
      });
      this.MemoryViewer.UpdateMemory(Response.data.MemoryArray);
      window.setTimeout(Load.bind(this), 20);
    }.call(this);
    void async function Load(){
      await window.LoadedPromise;
      const Response = await window.Main.Interpreter.MessageWorker("GetRegisters");
      for(let i = 0; i < 16; ++i) this.RegisterValueElements[i].innerText = Response.data.Registers[i];
      window.setTimeout(Load.bind(this), 20);
    }.call(this);
  }
};