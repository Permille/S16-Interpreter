import Compile from "./Compile.mjs";
import InterpreterBinary from "./Interpreter.wat";


const Memory = new WebAssembly.Memory({"initial": 3, "maximum": 3});
const InterpreterInstance = new WebAssembly.Instance(new WebAssembly.Module(InterpreterBinary), {
  "Main": {
    "Memory": Memory
  }
});
//InterpreterInstance.exports.Initialise();
//const Memory = InterpreterInstance.exports.memory;
//const Offset = 131072;
const Offset = 65536;
const Handlers = {};

Handlers.Compile = function(Event){
  const Text = Event.data.Message;
  try{
    Compile(Text, new Uint16Array(Memory.buffer, Offset, 65536));
  } catch({message}){
    return self.postMessage({
      "ID": Event.data.ID,
      "Failed": true,
      "ErrorMessage": message
    });
  }
  self.postMessage({
    "ID": Event.data.ID
  });
};

Handlers.Run = function(Event){
  console.time();
  const Iterations = Event.data.Message;
  InterpreterInstance.exports.Run(Iterations);
  self.postMessage({
    "ID": Event.data.ID
  });
  console.timeEnd();
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
    RegisterArray[i] = InterpreterInstance.exports.GetRegister(i);
  }
  self.postMessage({
    "ID": Event.data.ID,
    "Registers": RegisterArray
  }, [RegisterArray.buffer]);
};

self.onmessage = function(Event){
  Handlers[Event.data.Request](Event);
};