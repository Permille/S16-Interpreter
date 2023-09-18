import "./index.html?copy";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import WasmBinary from "./Main.wat";
const WasmModule = new WebAssembly.Module(WasmBinary);
const Memory = new WebAssembly.Memory({"initial": 0, "maximum": 0});
const WasmInstance = new WebAssembly.Instance(WasmModule, {
  "Main": {
    "Memory": Memory
  }
});
window.onload = function(){
  const Result = WasmInstance.exports.Main(1);
  document.body.append(document.createTextNode(`Wasm result: ${Result}`));

  const MonacoContainer = document.createElement("div");
  MonacoContainer.style.height = "300px";
  document.body.append(MonacoContainer);
  Monaco.editor.create(MonacoContainer, {
    "value": "console.log(\"hi\");",
    "theme": "vs-dark",
    "language": "javascript",
    "automaticLayout": true,
    "fontSize": 18
  });
};

