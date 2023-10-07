class RRR{
  static InstructionNameToOpcode = new Map([
    ["add", 0],
    ["sub", 1],
    ["mul", 2],
    ["div", 3],
    ["cmp", 4],
    ["addc", 5],
    ["muln", 6],
    ["divn", 7],
  ]);
  constructor(InstructionName, Destination, ParameterA, ParameterB){
    this.InstructionName = InstructionName;
    this.Opcode = RRR.InstructionNameToOpcode.get(this.InstructionName);
    if(this.Opcode === undefined) throw new Error("Opcode unknown for instruction mnemonic " + this.InstructionName);
    this.Destination = Destination;
    this.ParameterA = ParameterA;
    this.ParameterB = ParameterB;
    this.BinaryWordSize = 1;
  }
  EmitBinary(WordOffset, LabelToWordOffset, MemoryArray){
    MemoryArray[WordOffset] = this.Opcode << 12 | this.Destination << 8 | this.ParameterA << 4 | this.ParameterB;
  }
}
class RX{

}
class EXP{

}

function Afmt_RR(InstructionName, Parameters){
  const Match = /^R(\d+),R(\d+)$/.exec(Parameters);
  if(Match === null) throw new Error(`RR instruction wasn't formatted properly.`);
  const Registers = [];
  for(let i = 1; i < 3; ++i){
    if(Match[i] !== 0 && /^0+\d/.test(Match[i])) throw new Error(`Leading zeros in register numbers are not allowed.`);
    const Number = parseInt(Match[i]);
    if(Number > 15) throw new Error(`Trying to access out of bounds register.`);
    Registers.push(Number);
  }
  return new RRR(InstructionName, 0, ...Registers);
}
function Afmt_RRR(InstructionName, Parameters){
  const Match = /^R(\d+),R(\d+),R(\d+)$/.exec(Parameters);
  if(Match === null) throw new Error(`RRR instruction wasn't formatted properly.`);
  const Registers = [];
  for(let i = 1; i < 4; ++i){
    if(Match[i] !== 0 && /^0+\d/.test(Match[i])) throw new Error(`Leading zeros in register numbers are not allowed.`);
    const Number = parseInt(Match[i]);
    if(Number > 15) throw new Error(`Trying to access out of bounds register.`);
    Registers.push(Number);
  }
  return new RRR(InstructionName, ...Registers);
}
const Handlers = new Map([
  ["add", Afmt_RRR],
  ["sub", Afmt_RRR],
  ["mul", Afmt_RRR],
  ["div", Afmt_RRR],
  ["cmp", Afmt_RR],
  ["addc", Afmt_RRR],
  ["muln", Afmt_RRR],
  ["divn", Afmt_RRR],
  ["trap", Afmt_RRR]
]);

export default function Compile(Text, MemoryArray){
  const Rows = Text.split(/\r?\n/);
  const LabelToWordOffset = new Map;
  const Instructions = [];
  for(let i = 0, WordOffset = 0, Length = Rows.length; i < Length; ++i){
    const ContainsIllegalCharacters = /[^\r\na-zA-Z_0-9 \t,;"'.\$\[\]\(\)+\-*?\u00ac\u00a3`<=>!%\^&\{\}#~@:|\/\\]/.exec(Rows[i]);
    if(ContainsIllegalCharacters !== null){
      throw new Error(`Illegal character "${ContainsIllegalCharacters[0]}" found at line ${i + 1}, column ${ContainsIllegalCharacters.index + 1}`);
    }
    const [Label, InstructionName, Parameters] = Rows[i].replaceAll(/\s+/g, " ").replace(/ *;.*/, "").split(/ /);
    if(Label !== ""){
      if(LabelToWordOffset.has(Label)) throw new Error(`Line ${i}: The label ${Label} has already been defined for location ${LabelToWordOffset.get(Label)}.`);
      LabelToWordOffset.set(Label, WordOffset);
    }
    if(InstructionName === "" || InstructionName === undefined) continue;
    if(!Handlers.has(InstructionName)) throw new Error(`Line ${i}: Unknown instruction mnemonic ${InstructionName}.`);
    const Handler = Handlers.get(InstructionName);
    const Instruction = Handler(InstructionName, Parameters);
    Instructions.push(Instruction);
    WordOffset += Instruction.BinaryWordSize;
  }
  
  for(let i = 0, WordOffset = 0, Length = Instructions.length; i < Length; ++i){
    Instructions[i].EmitBinary(WordOffset, LabelToWordOffset, MemoryArray);
    WordOffset += Instructions[i].BinaryWordSize;
  }
};