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
  const Iterations = Event.data.Message;
  const Code = InterpreterInstance.exports.Run(Iterations);
  self.postMessage({
    "ID": Event.data.ID,
    "Code": Code
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
    RegisterArray[i] = InterpreterInstance.exports.GetRegister(i);
  }
  self.postMessage({
    "ID": Event.data.ID,
    "Registers": RegisterArray
  }, [RegisterArray.buffer]);
};
Handlers.GetMemoryArray = function(Event){
  const Min = Event.data.Message.Min;
  const Max = Event.data.Message.Max;
  const MemoryArray = new Uint16Array(Max - Min);
  const u16 = new Uint16Array(Memory.buffer, 65536);
  for(let i = Min, Index = 0; i < Max; ++i){
    MemoryArray[Index++] = u16[i];
  }
  self.postMessage({
    "ID": Event.data.ID,
    "MemoryArray": MemoryArray
  }, [MemoryArray.buffer]);
}

self.onmessage = function(Event){
  Handlers[Event.data.Request](Event);
};