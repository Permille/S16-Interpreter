import "./InterpreterTab.css";
import Tab from "./Tab.mjs";

export default class InterpreterTab extends Tab{
  constructor(Button, Body){
    super(Button, Body);
    this.Body.querySelector(".CompileButton").addEventListener("click", function(){
      window.Main.Interpreter.Compile(window.Main.Interface.Tabs.get("Editor").GetText());
    }.bind(this));
    this.Body.querySelector(".ResetButton").addEventListener("click", async function(){
      await window.Main.Interpreter.Reset();
    }.bind(this));
    this.Body.querySelector(".RunButton").addEventListener("click", async function(){
      await window.Main.Interpreter.Run(16777216);
    }.bind(this));
    
    void async function Load(){
      await window.LoadedPromise;
      window.Main.Interpreter.Events.addEventListener("Yield", function(){
        window.Main.Interpreter.Run(16777216);
      });
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

    const MemoryViewWrapperElement = this.Body.querySelector(".MemoryView");

    
    this.ReceivedMemoryUpdate = false;

    void async function Load(){
      await window.LoadedPromise;
      const Response = await window.Main.Interpreter.MessageWorker("GetRegisters");
      for(let i = 0; i < 16; ++i) this.RegisterValueElements[i].innerText = Response.data.Registers[i];
      window.setTimeout(Load.bind(this), 20);
    }.call(this);
  }
};