import "./Interface/Interface.mjs";
import WasmBinary from "./Main.wat";
const WasmModule = new WebAssembly.Module(WasmBinary);
const Memory = new WebAssembly.Memory({"initial": 0, "maximum": 0});
const WasmInstance = new WebAssembly.Instance(WasmModule, {
  "Main": {
    "Memory": Memory
  }
});


