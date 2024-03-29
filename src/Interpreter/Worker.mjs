import Compile from "./Compile.mjs";
import InterpreterBinary from "./Interpreter.wat";

new class Interpreter{
  constructor(){
    this.Memory = null;
    this.InterpreterInstance = null;
    this.InterpreterModule = new WebAssembly.Module(InterpreterBinary);
    this.IOBufferString = "";
    this.LinearMemoryOffset = 65536;
    self.onmessage = function(Event){
      const Response = this.Handlers[Event.data.Request](Event);
      if(Event.data.ID !== -1) self.postMessage({
        ...(Response ?? {}),
        "ID": Event.data.ID
      });
    }.bind(this);
    this.Handlers = {
      "Initialise": function(Event){
        const MemorySegments = Event.data.Message.MemorySegments;
        this.Memory = new WebAssembly.Memory({"initial": 1 + MemorySegments, "maximum": 65536});
        this.InterpreterInstance = new WebAssembly.Instance(this.InterpreterModule, {
          "Main": {
            "Memory": this.Memory
          },
          "Instructions": {
            "I:Trap:Read": this.TrapReadImplementation.bind(this),
            "I:Trap:Write": this.TrapWriteImplementation.bind(this)
          }
        });
      }.bind(this),
      "Compile": function(Event){
        const Text = Event.data.Message;
        try{
          Compile(Text, new Uint16Array(this.Memory.buffer, this.LinearMemoryOffset, 65536));
        } catch({message}){
          return {
            "Failed": true,
            "ErrorMessage": message
          };
        }
      }.bind(this),
      "Run": function(Event){
        const Iterations = Event.data.Message.Iterations;
        this.IOBufferString = Event.data.Message.IOBufferString;
        const Code = this.InterpreterInstance.exports.Run(Iterations);
        return {
          "Code": Code,
          "IOBufferString": this.IOBufferString
        };
      }.bind(this),
      "Reset": function(Event){
        this.InterpreterInstance.exports.Reset();
      }.bind(this),
      "GetRegisters": function(Event){
        const RegisterArray = new Uint32Array(16);
        for(let i = 0; i < 16; ++i){
          RegisterArray[i] = this.InterpreterInstance.exports.GetRegister_32(i);
        }
        return {
          "Registers": RegisterArray
        };
      }.bind(this),
      "GetMemoryArray": function(Event){
        const Min = Event.data.Message.Min;
        const Max = Event.data.Message.Max;
        const MemoryArray = new Uint16Array(Max - Min);
        const u16 = new Uint16Array(this.Memory.buffer, 65536);
        for(let i = Min, Index = 0; i < Max; ++i){
          MemoryArray[Index++] = u16[i];
        }
        return {
          "MemoryArray": MemoryArray
        };
      }.bind(this),
      "GetCurrentProgramCounter": function(Event){
        return {
          "Line": this.InterpreterInstance.exports.InstructionAddress.value >> 1
        };
      }.bind(this),
      "GetStateSummary": function(Event){
        return {
          "ProgramCounter": this.InterpreterInstance.exports.InstructionAddress.value >> 1,
          "InstructionsRun": this.InterpreterInstance.exports.InstructionsExecuted.value
        };
      }.bind(this)
    };
  }
  TrapReadImplementation(A, B){
    const u16 = new Uint16Array(this.Memory.buffer, this.LinearMemoryOffset);
    
    const Length = this.IOBufferString.length;
    const BufferAddress = A;
    const BufferSize = B;
    const Min = Math.min(Length, BufferSize);
    const Input = this.IOBufferString.substring(0, Min);
    for(let i = 0; i < Min; ++i){
      u16[BufferAddress + i] = Input.charCodeAt(i);
    }
    this.IOBufferString = this.IOBufferString.substring(Min, Length);
    self.postMessage({
      "ID": -1,
      "Request": "Output",
      "Message": Input
    });
    return [BufferAddress, Min];
  }
  TrapWriteImplementation(A, B){
    const BufferAddress = A;
    const BufferSize = B;
    const Memory = new Uint16Array(this.Memory.buffer, this.LinearMemoryOffset + BufferAddress * 2, BufferSize);
    const Message = String.fromCharCode(...Memory);
    self.postMessage({
      "ID": -1,
      "Request": "Output",
      "Message": Message
    });
  }
};