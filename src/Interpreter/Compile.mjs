class InstructionType{
  constructor(GetNextOffset, AfmtParsers){
    this.GetNextOffset = GetNextOffset;
    this.AfmtParsers = AfmtParsers;
  }
}
const RRR = new InstructionType(x => x + 1, new Map([
  ["RR", function(Opcode, Argument){
    const Match = /^R(\d+),R(\d+)$/.exec(Argument);
    if(Match === null) throw new Error(`RR instruction wasn't formatted properly.`);
    const Registers = [];
    for(let i = 1; i < 3; ++i){
      if(Match[i] !== 0 && /^0+\d/.test(Match[i])) throw new Error(`Leading zeros in register IDs are not allowed.`);
      const ID = Number.parseInt(Match[i]);
      if(ID > 15) throw new Error(`Trying to access out of bounds register.`);
      Registers.push(ID);
    }
    return [Opcode << 12 | Registers[0] << 4 | Registers[1]];
  }],
  ["RRR", function(Opcode, Argument){
    const Match = /^R(\d+),R(\d+),R(\d+)$/.exec(Argument);
    if(Match === null) throw new Error(`RRR instruction wasn't formatted properly.`);
    const Registers = [];
    for(let i = 1; i < 4; ++i){
      if(Match[i] !== 0 && /^0+\d/.test(Match[i])) throw new Error(`Leading zeros in register IDs are not allowed.`);
      const ID = Number.parseInt(Match[i]);
      if(ID > 15) throw new Error(`Trying to access out of bounds register.`);
      Registers.push(ID);
    }
    return [Opcode << 12 | Registers[0] << 8 | Registers[1] << 4 | Registers[2]];
  }]
]));

const RX = new InstructionType(x => x + 2, new Map([
  ["RRX", function(Opcode, Argument, LabelToWordOffset){

  }],
  ["KRX", function(Opcode, Argument, LabelToWordOffset){

  }],
  ["X", function(Opcode, Argument, LabelToWordOffset){

  }]
]));

const EXP = new InstructionType(x => x + 2, new Map([

]));

const Instructions = new Map([
  ["add", [RRR, RRR.AfmtParsers.get("RRR").bind(null, 0)]],
  ["sub", [RRR, RRR.AfmtParsers.get("RRR").bind(null, 1)]],
  ["mul", [RRR, RRR.AfmtParsers.get("RRR").bind(null, 2)]],
  ["div", [RRR, RRR.AfmtParsers.get("RRR").bind(null, 3)]],
  ["cmp", [RRR, RRR.AfmtParsers.get("RR").bind(null, 4)]],
  ["addc", [RRR, RRR.AfmtParsers.get("RRR").bind(null, 5)]],
  ["muln", [RRR, RRR.AfmtParsers.get("RRR").bind(null, 6)]],
  ["divn", [RRR, RRR.AfmtParsers.get("RRR").bind(null, 7)]],
  ["trap", [RRR, RRR.AfmtParsers.get("RRR").bind(null, 12)]],
  ["lea", [RX, RX.AfmtParsers.get("RRX").bind(null, 0)]],
  ["load", [RX, RX.AfmtParsers.get("RRX").bind(null, 1)]],
  ["store", [RX, RX.AfmtParsers.get("RRX").bind(null, 2)]],
  ["jump", [RX, RX.AfmtParsers.get("X").bind(null, 3)]],
  ["jumpc0", [RX, RX.AfmtParsers.get("KRX").bind(null, 4)]],
  ["jumpc1", [RX, RX.AfmtParsers.get("KRX").bind(null, 5)]],
  ["jal", [RX, RX.AfmtParsers.get("RRX").bind(null, 6)]],
  ["tstset", [RX, RX.AfmtParsers.get("RRX").bind(null, 7)]]
]);

export default function Compile(Text, MemoryArray){
  const Rows = Text.split(/\r?\n/);
  const LabelToWordOffset = new Map;
  const InstructionList = [];
  
  //Parse instructions and resolve labels
  for(let i = 0, WordOffset = 0, Length = Rows.length; i < Length; ++i){
    const ContainsIllegalCharacters = /[^\r\na-zA-Z_0-9 \t,;"'.\$\[\]\(\)+\-*?\u00ac\u00a3`<=>!%\^&\{\}#~@:|\/\\]/.exec(Rows[i]);
    if(ContainsIllegalCharacters !== null){
      throw new Error(`Illegal character "${ContainsIllegalCharacters[0]}" found at line ${i + 1}, column ${ContainsIllegalCharacters.index + 1}`);
    }
    const [Label, InstructionName, Argument] = Rows[i].replaceAll(/\s+/g, " ").replace(/ *;.*/, "").split(/ /);
    if(Label !== ""){
      if(LabelToWordOffset.has(Label)) throw new Error(`Line ${i}: The label ${Label} has already been defined for location ${LabelToWordOffset.get(Label)}.`);
      LabelToWordOffset.set(Label, WordOffset);
    }
    if(InstructionName === "" || InstructionName === undefined) continue;
    if(!Instructions.has(InstructionName)) throw new Error(`Line ${i}: Unknown instruction mnemonic ${InstructionName}.`);

    const [Type, Parser] = Instructions.get(InstructionName);
    InstructionList.push([i, WordOffset, Parser.bind(null, Argument, LabelToWordOffset)]);
    WordOffset = Type.GetNextOffset(WordOffset, Argument);
  }

  //Emit instructions
  for(const [Line, WordOffset, Parser] of InstructionList){
    try{
      const Result = Parser();
      for(let i = 0; i < Result.length; ++i) MemoryArray[WordOffset + i] = Result[i];
    } catch({message}){
      throw new Error(`Line ${Line}: Couldn't parse instruction argument: ${message}`);
    }
  }
};