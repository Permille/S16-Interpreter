class InstructionType{
  constructor(GetNextOffset, AfmtParsers){
    this.GetNextOffset = GetNextOffset;
    this.AfmtParsers = AfmtParsers;
  }
}
const RRR = new InstructionType(x => x + 1, new Map([
  ["RR", function(Opcode, Argument){
    const Match = /^R(\d+),R(\d+)$/.exec(Argument);
    if(Match === null) throw new Error(`RR-format instruction wasn't formatted properly.`);
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
    if(Match === null) throw new Error(`RRR-format instruction wasn't formatted properly.`);
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

function ResolveImmediateValue(Decimal, Hexadecimal, Label, LabelToWordOffset){
  let ImmediateOffset;
  if(Decimal !== undefined) ImmediateOffset = Number.parseInt(Decimal);
  else if(Hexadecimal !== undefined) Number.parseInt(Hexadecimal.substring(1), 16);
  else if(Label !== undefined){
    if(!LabelToWordOffset.has(Label)) throw new Error(`Unknown label "${Label}".`);
    ImmediateOffset = LabelToWordOffset.get(Label);
  }
  if(ImmediateOffset < -32768 || ImmediateOffset > 65535) ImmediateOffset = 0;
  ImmediateOffset &= 65535;
  return ImmediateOffset;
}

const RX = new InstructionType(x => x + 2, new Map([
  ["RRX", function(Opcode, Argument, LabelToWordOffset){
    const Match = /^R(\d+),((-?\d+)|(\$[0-9a-f])|([a-zA-Z][a-z_A-Z0-9]*))(\[R(\d+)\])?$/.exec(Argument);
    if(Match === null) throw new Error(`RRX-format instruction wasn't formatted properly.`);
    const DestinationRegisterID = Number.parseInt(Match[1]);
    const OffsetRegisterID = Number.parseInt(Match[7] || "0");
    const ImmediateOffset = ResolveImmediateValue(Match[3], Match[4], Match[5], LabelToWordOffset);
    return [0xf << 12 | DestinationRegisterID << 8 | OffsetRegisterID << 4 | Opcode, ImmediateOffset];
  }],
  ["KRX", function(Opcode, Argument, LabelToWordOffset){
    const Match = /^((-?\d+)|(\$[0-9a-f])|([a-zA-Z][a-z_A-Z0-9]*)),((-?\d+)|(\$[0-9a-f])|([a-zA-Z][a-z_A-Z0-9]*))(\[R(\d+)\])?$/.exec(Argument);
    if(Match === null) throw new Error(`KRX-format instruction wasn't formatted properly.`);
    const SelectedBit = ResolveImmediateValue(Match[2], Match[3], Match[4], LabelToWordOffset);
    const OffsetRegisterID = Number.parseInt(Match[10] || "0");
    const ImmediateOffset = ResolveImmediateValue(Match[6], Match[7], Match[8], LabelToWordOffset);
    return [0xf << 12 | SelectedBit << 8 | OffsetRegisterID << 4 | Opcode, ImmediateOffset];
  }],
  ["X", function(Opcode, Argument, LabelToWordOffset){
    const Match = /^((-?\d+)|(\$[0-9a-f])|([a-zA-Z][a-z_A-Z0-9]*))$/.exec(Argument);
    if(Match === null) throw new Error(`X-format instruction wasn't formatted properly.`);
    const ImmediateOffset = ResolveImmediateValue(Match[2], Match[3], Match[4], LabelToWordOffset);
    return [0xf << 12 | Opcode, ImmediateOffset];
  }]
]));

const EXP = new InstructionType(x => x + 2, new Map([
  ["X", function(){throw new Error("not implemented")}]
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
  ["tstset", [RX, RX.AfmtParsers.get("RRX").bind(null, 11)]],
  ["brf", [EXP, EXP.AfmtParsers.get("X").bind(null, 0)]],
  ["brb", [EXP, EXP.AfmtParsers.get("X").bind(null, 1)]],
  ["brfc0", [EXP, EXP.AfmtParsers.get("X").bind(null, 2)]],
  ["brbc0", [EXP, EXP.AfmtParsers.get("X").bind(null, 3)]],
  ["brfc1", [EXP, EXP.AfmtParsers.get("X").bind(null, 4)]],
  ["brbc1", [EXP, EXP.AfmtParsers.get("X").bind(null, 5)]],
  ["brfz", [EXP, EXP.AfmtParsers.get("X").bind(null, 6)]],
  ["brbz", [EXP, EXP.AfmtParsers.get("X").bind(null, 7)]],
  ["brfnz", [EXP, EXP.AfmtParsers.get("X").bind(null, 8)]],
  ["brbnz", [EXP, EXP.AfmtParsers.get("X").bind(null, 9)]],
  ["dsptch", [EXP, EXP.AfmtParsers.get("X").bind(null, 10)]],
  ["save", [EXP, EXP.AfmtParsers.get("X").bind(null, 11)]],
  ["restor", [EXP, EXP.AfmtParsers.get("X").bind(null, 12)]],
  ["push", [EXP, EXP.AfmtParsers.get("X").bind(null, 13)]],
  ["pop", [EXP, EXP.AfmtParsers.get("X").bind(null, 14)]],
  ["top", [EXP, EXP.AfmtParsers.get("X").bind(null, 15)]],
  ["shiftl", [EXP, EXP.AfmtParsers.get("X").bind(null, 16)]],
  ["shiftr", [EXP, EXP.AfmtParsers.get("X").bind(null, 17)]],
  ["logicw", [EXP, EXP.AfmtParsers.get("X").bind(null, 18)]],
  ["logicb", [EXP, EXP.AfmtParsers.get("X").bind(null, 19)]],
  ["logicc", [EXP, EXP.AfmtParsers.get("X").bind(null, 20)]],
  ["extrc", [EXP, EXP.AfmtParsers.get("X").bind(null, 21)]],
  ["extrci", [EXP, EXP.AfmtParsers.get("X").bind(null, 22)]],
  ["getctl", [EXP, EXP.AfmtParsers.get("X").bind(null, 23)]],
  ["putctl", [EXP, EXP.AfmtParsers.get("X").bind(null, 24)]],
  ["resume", [EXP, EXP.AfmtParsers.get("X").bind(null, 25)]]
]);

/*
 brf 3
0000 e000
0001 0003
 brb 3
0002 e001
0003 0003
 brfc0 R1,3,213
0004 e102
0005 30d5
 brbc0 R1,2,123
0006 e103
0007 207b
 brfc1 R3,2,21342
0008 e304
0009 235e
 brbc1 R2,6,34322
000a e205
000b 6612
 brfz R11,123
000c eb06
000d 007b
 brbz R11,12312
000e eb07
000f 3018
 brfnz R9,121
0010 e908
0011 0079
 brbnz R13,42424
0012 ed09
0013 a5b8
 dsptch R2,5,0
0014 e20a
0015 5000
 save R14,R2,20[R4]
0016 ee0b
0017 2414
 restor R14,R2,20[R4]
0018 ee0c
0019 2414
 push R1,R2,R3
001a e10d
001b 2300
 pop R1,R2,R3
001c e10e
001d 2300
 top R1,R2,R3
001e e10f
001f 2300
 shiftl R1,R2,3
0020 e110
0021 2003
 shiftr R3,R4,12
0022 e311
0023 400c
 logicw R4,R2,R3,6
0024 e412
0025 2306
 logicb R1,2,3,4,5
0026 e113
0027 2345
 logicc R2,3,R4,5,6
0028 e214
0029 3456
 extrc R1,2,3,R4,5
002a e115
002b 4235
 extrci R1,2,3,R4,5
002c e116
002d 4235
 getctl R4,status
002e e017
002f 4000
 putctl R4,status
0030 e018
0031 4000
 resume
0032 e019
0033 0000
*/

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