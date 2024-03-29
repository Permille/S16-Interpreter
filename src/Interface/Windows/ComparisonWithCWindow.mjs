import WindowFrame from "../WindowFrame/WindowFrame.mjs";
import CWasmBinary from "!!arraybuffer-loader!./ComparisonWithC/Main.wasm";

function StandardDeviation(Data) {
  const Average = Data.reduce((a, b) => a + b) / Data.length;
  const StandardDeviation = Math.sqrt(Data.map(a => (a - Average) ** 2).reduce((a, b) => a + b) / Data.length);
  return [Average, StandardDeviation];
}

export default class ComparisonWithCWindow{
  constructor(){
    const Window = new WindowFrame(900, 400);
    Window.SetTitle("C and WAT comparison");
    Window.SetPosition(100, 100);

    const Wrapper = document.createElement("div");
    Wrapper.style.paddingInline = "50px";
    Wrapper.style.paddingBlock = "15px";
    Wrapper.style.fontSize = "16px";
    Wrapper.append(document.createTextNode("This is a benchmark comparing the performance of individual instructions between the C and WAT implementations of the Sigma16 interpreter."));
    Wrapper.append(document.createElement("br"));
    Wrapper.append(document.createTextNode("The following instructions will be tested: add, sub, mul, div, cmp, addc, muln and cmp."));
    Wrapper.append(document.createElement("br"));


    const ButtonsWrapper = document.createElement("div");
    ButtonsWrapper.style.fontSize = "16px";
    ButtonsWrapper.classList.add("ButtonsWrapper");
    const SubmitButton = document.createElement("div");
    SubmitButton.style.width = "200px";
    SubmitButton.innerText = "Start Test";
    ButtonsWrapper.append(SubmitButton);

    Wrapper.append(ButtonsWrapper);

    const Confirmation = document.createElement("div");
    Wrapper.append(Confirmation);
    SubmitButton.addEventListener("click", async function(){
      console.log(CWasmBinary);
      const CMemory = new WebAssembly.Memory({"initial": 4});
      const CMemoryArray = new Uint16Array(CMemory.buffer, 131072);
      const CInstance = new WebAssembly.Instance(new WebAssembly.Module(CWasmBinary), {
        "env": {
          "memory": CMemory
        }
      });
      console.log(CInstance);
      
      Confirmation.innerText = "Test is running...";

      for(const Instruction of [
        "add",
        "sub",
        "mul",
        "div",
        "addc",
        "muln",
        "cmp",
      ]){
        Wrapper.append(document.createTextNode("Testing instruction " + Instruction));
        Wrapper.append(document.createElement("br"));
        const WATResults = [];
        await window.Main.Interpreter.Compile(this.TestInstruction(Instruction));
        for(let i = 0; i < 50; ++i){
          const Start = window.performance.now();
          await window.Main.Interpreter.Run(100000000);
          const Time = window.performance.now() - Start;
          if(i > 1) WATResults.push(Time); //JIT compiler may not have optimised the module in the first iterations
        }
        const [WATAverage, WATStandardDeviation] = StandardDeviation(WATResults);
        Wrapper.append(document.createTextNode(`WAT average: ${Math.round(WATAverage)}ms, stdev: ${WATStandardDeviation.toFixed(1)}ms (${(WATStandardDeviation / WATAverage * 100).toFixed(1)}%)`));
        Wrapper.append(document.createElement("br"));
        
        const WATMemoryArray = (await window.Main.Interpreter.MessageWorker("GetMemoryArray", {
          "Min": 0,
          "Max": 256
        })).data.MemoryArray;
        for(let i = 0; i < 256; ++i){
          CInstance.exports.SetMemory(i, WATMemoryArray[i]);
        }
        const CResults = [];
        for(let i = 0; i < 50; ++i){
          const Start = window.performance.now();
          CInstance.exports.Run(100000000);
          const Time = window.performance.now() - Start;
          if(i > 1) CResults.push(Time);
        }
        const [CAverage, CStandardDeviation] = StandardDeviation(CResults);
        Wrapper.append(document.createTextNode(`C average: ${Math.round(CAverage)}ms, stdev: ${CStandardDeviation.toFixed(1)}ms (${(CStandardDeviation / CAverage * 100).toFixed(1)}%)`));
        Wrapper.append(document.createElement("br"));
      }

      
    }.bind(this));
    
    Window.BodyElement.append(Wrapper);
  }
  TestInstruction(Instruction){
    if(Instruction === "cmp") return `
      lea R1,123[R0]
      cmp R2,R1
      cmp R2,R1
      cmp R2,R1
      cmp R2,R1
      cmp R2,R1
      cmp R2,R1
      cmp R2,R1
      cmp R2,R1
      jump 2
    `;

    return `
      lea R1,123[R0]
      ${Instruction} R3,R2,R1
      ${Instruction} R3,R2,R1
      ${Instruction} R3,R2,R1
      ${Instruction} R3,R2,R1
      ${Instruction} R3,R2,R1
      ${Instruction} R3,R2,R1
      ${Instruction} R3,R2,R1
      ${Instruction} R3,R2,R1
      jump 2
    `;
  }
};