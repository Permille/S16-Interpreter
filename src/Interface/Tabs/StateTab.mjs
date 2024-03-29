import "./StateTab.css";
import Tab from "./Tab.mjs";
import MemoryViewer from "../MemoryViewer.mjs";

export default class StateTab extends Tab{
  constructor(Button, Body){
    super(Button, Body);
    this.IsIn32BitMode = false;

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
        RegisterValueElement.innerText = 0;
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
      for(let i = 0; i < 16; ++i) this.RegisterValueElements[i].innerText = this.IsIn32BitMode ? Response.data.Registers[i] : Response.data.Registers[i] & 65535;
      window.setTimeout(Load.bind(this), 20);
    }.call(this);
  }
  Toggle32BitMode(){
    this.IsIn32BitMode = !this.IsIn32BitMode;
    if(this.IsIn32BitMode){
      this.Body.querySelector(".RegistersList").classList.add("Is32Bit");
      this.MemoryViewer.RootElement.classList.add("Is32Bit");
    } else{
      this.Body.querySelector(".RegistersList").classList.remove("Is32Bit");
      this.MemoryViewer.RootElement.classList.remove("Is32Bit");
    }
    this.MemoryViewer.Set32BitMode(this.IsIn32BitMode);
  }
};