import Compile from "./Compile.mjs";
import InterpreterBinary from "./Interpreter.wat";
import GetRegisterBinary from "./Registers.wat";


const Memory = new WebAssembly.Memory({"initial": 2, "maximum": 2});
const RegistersInstance = new WebAssembly.Instance(new WebAssembly.Module(GetRegisterBinary));
const InterpreterInstance = new WebAssembly.Instance(new WebAssembly.Module(InterpreterBinary), {
  "Main": {
    "Memory": Memory,
    "GetRegister": RegistersInstance.exports.GetRegister,
    "SetRegister": RegistersInstance.exports.SetRegister
  }
});
const Handlers = {};

Handlers.Compile = function(Event){
  const Text = Event.data.Message;
  try{
    Compile(Text, Memory);
  } catch(error){
    return self.postMessage({
      "ID": Event.data.ID,
      "Failed": true
    });
  }
  self.postMessage({
    "ID": Event.data.ID
  });
};

Handlers.Run = function(Event){
  const Iterations = Event.data.Message;
  InterpreterInstance.exports.Run(Iterations);
  self.postMessage({
    "ID": Event.data.ID
  });
};
Handlers.Reset = function(Event){
  InterpreterInstance.exports.Reset();
  self.postMessage({
    "ID": Event.data.ID
  });
};
Handlers.GetRegisters = function(Event){
  const RegisterArray = new Uint16Array(16);
  for(let i = 0; i < 16; ++i){
    RegisterArray[i] = RegistersInstance.exports.GetRegister(i);
  }
  self.postMessage({
    "ID": Event.data.ID,
    "Registers": RegisterArray
  }, [RegisterArray.buffer]);
};

self.onmessage = function(Event){
  Handlers[Event.data.Request](Event);
};