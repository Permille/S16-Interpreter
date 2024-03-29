class InstructionType{
  constructor(GetNextOffset, AfmtParsers){
    this.GetNextOffset = GetNextOffset;
    this.AfmtParsers = AfmtParsers;
  }
}
export const RRR = new InstructionType(x => x + 1, new Map([
  ["RR", function RR(Opcode, Argument){
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
  ["RRR", function RRR(Opcode, Argument){
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

export const ERRR = new InstructionType(x => x + 2, new Map([
  ["RR", function RR(Opcode, Argument){
    const Match = /^R(\d+),R(\d+)$/.exec(Argument);
    if(Match === null) throw new Error(`RR-format instruction wasn't formatted properly.`);
    const Registers = [];
    for(let i = 1; i < 3; ++i){
      if(Match[i] !== 0 && /^0+\d/.test(Match[i])) throw new Error(`Leading zeros in register IDs are not allowed.`);
      const ID = Number.parseInt(Match[i]);
      if(ID > 15) throw new Error(`Trying to access out of bounds register.`);
      Registers.push(ID);
    }
    return [0xd000, Opcode << 12 | Registers[0] << 4 | Registers[1]];
  }],
  ["RRR", function RRR(Opcode, Argument){
    const Match = /^R(\d+),R(\d+),R(\d+)$/.exec(Argument);
    if(Match === null) throw new Error(`RRR-format instruction wasn't formatted properly.`);
    const Registers = [];
    for(let i = 1; i < 4; ++i){
      if(Match[i] !== 0 && /^0+\d/.test(Match[i])) throw new Error(`Leading zeros in register IDs are not allowed.`);
      const ID = Number.parseInt(Match[i]);
      if(ID > 15) throw new Error(`Trying to access out of bounds register.`);
      Registers.push(ID);
    }
    return [0xd000, Opcode << 12 | Registers[0] << 8 | Registers[1] << 4 | Registers[2]];
  }]
]));

function ResolveImmediateValue(Decimal, Hexadecimal, Label, LabelToWordOffset, Is32Bit = false){
  let ImmediateOffset;
  if(Decimal !== undefined) ImmediateOffset = Number.parseInt(Decimal);
  else if(Hexadecimal !== undefined) ImmediateOffset = Number.parseInt(Hexadecimal.substring(1), 16);
  else if(Label !== undefined){
    if(!LabelToWordOffset.has(Label)) throw new Error(`Unknown label "${Label}".`);
    ImmediateOffset = LabelToWordOffset.get(Label);
  }
  if(!Is32Bit){
    if(ImmediateOffset < -32768 || ImmediateOffset > 65535) ImmediateOffset = 0;
    ImmediateOffset &= 65535;
  } else{
    ImmediateOffset >>>= 0; //Convert to unsigned 32-bit number
  }
  
  return ImmediateOffset;
}

export const RX = new InstructionType(x => x + 2, new Map([
  ["RRX", function RRX(Opcode, Argument, LabelToWordOffset){
    const Match = /^R(\d+),((-?\d+)|(\$[0-9a-f]+)|([a-zA-Z][a-z_A-Z0-9]*))(\[R(\d+)\])?$/.exec(Argument);
    if(Match === null) throw new Error(`RRX-format instruction wasn't formatted properly.`);
    const DestinationRegisterID = Number.parseInt(Match[1]);
    const OffsetRegisterID = Number.parseInt(Match[7] || "0");
    const ImmediateOffset = ResolveImmediateValue(Match[3], Match[4], Match[5], LabelToWordOffset);
    return [0xf << 12 | DestinationRegisterID << 8 | OffsetRegisterID << 4 | Opcode, ImmediateOffset];
  }],
  ["KRX", function KRX(Opcode, Argument, LabelToWordOffset){
    const Match = /^((-?\d+)|(\$[0-9a-f]+)|([a-zA-Z][a-z_A-Z0-9]*)),((-?\d+)|(\$[0-9a-f]+)|([a-zA-Z][a-z_A-Z0-9]*))(\[R(\d+)\])?$/.exec(Argument);
    if(Match === null) throw new Error(`KRX-format instruction wasn't formatted properly.`);
    const SelectedBit = ResolveImmediateValue(Match[2], Match[3], Match[4], LabelToWordOffset);
    const OffsetRegisterID = Number.parseInt(Match[10] || "0");
    const ImmediateOffset = ResolveImmediateValue(Match[6], Match[7], Match[8], LabelToWordOffset);
    return [0xf << 12 | SelectedBit << 8 | OffsetRegisterID << 4 | Opcode, ImmediateOffset];
  }],
  ["X", function X(Opcode, Argument, LabelToWordOffset){
    const Match = /^((-?\d+)|(\$[0-9a-f]+)|([a-zA-Z][a-z_A-Z0-9]*))(\[R(\d+)\])?$/.exec(Argument);
    if(Match === null) throw new Error(`X-format instruction wasn't formatted properly.`);
    const ImmediateOffset = ResolveImmediateValue(Match[2], Match[3], Match[4], LabelToWordOffset);
    const OffsetRegisterID = Number.parseInt(Match[6] || "0");
    return [0xf << 12 | OffsetRegisterID << 4 | Opcode, ImmediateOffset];
  }]
]));

export const ERX = new InstructionType(x => x + 4, new Map([
  ["RRX", function RRX(Opcode, Argument, LabelToWordOffset){
    const Match = /^R(\d+),((-?\d+)|(\$[0-9a-f]+)|([a-zA-Z][a-z_A-Z0-9]*))(\[R(\d+)\])?$/.exec(Argument);
    if(Match === null) throw new Error(`RRX-format instruction wasn't formatted properly.`);
    const DestinationRegisterID = Number.parseInt(Match[1]);
    const OffsetRegisterID = Number.parseInt(Match[7] || "0");
    const ImmediateOffset = ResolveImmediateValue(Match[3], Match[4], Match[5], LabelToWordOffset, true);
    return [0xd000, 0xf << 12 | DestinationRegisterID << 8 | OffsetRegisterID << 4 | Opcode, ImmediateOffset & 65535, ImmediateOffset >> 16];
  }],
  ["KRX", function KRX(Opcode, Argument, LabelToWordOffset){
    const Match = /^((-?\d+)|(\$[0-9a-f]+)|([a-zA-Z][a-z_A-Z0-9]*)),((-?\d+)|(\$[0-9a-f]+)|([a-zA-Z][a-z_A-Z0-9]*))(\[R(\d+)\])?$/.exec(Argument);
    if(Match === null) throw new Error(`KRX-format instruction wasn't formatted properly.`);
    const SelectedBit = ResolveImmediateValue(Match[2], Match[3], Match[4], LabelToWordOffset);
    const OffsetRegisterID = Number.parseInt(Match[10] || "0");
    const ImmediateOffset = ResolveImmediateValue(Match[6], Match[7], Match[8], LabelToWordOffset, true);
    return [0xd000, 0xf << 12 | SelectedBit << 8 | OffsetRegisterID << 4 | Opcode, ImmediateOffset & 65535, ImmediateOffset >> 16];
  }],
  ["X", function X(Opcode, Argument, LabelToWordOffset){
    const Match = /^((-?\d+)|(\$[0-9a-f]+)|([a-zA-Z][a-z_A-Z0-9]*))(\[R(\d+)\])?$/.exec(Argument);
    if(Match === null) throw new Error(`X-format instruction wasn't formatted properly.`);
    const ImmediateOffset = ResolveImmediateValue(Match[2], Match[3], Match[4], LabelToWordOffset, true);
    const OffsetRegisterID = Number.parseInt(Match[6] || "0");
    return [0xd000, 0xf << 12 | OffsetRegisterID << 4 | Opcode, ImmediateOffset & 65535, ImmediateOffset >> 16];
  }]
]));

export const PseudoRX = new InstructionType(x => x + 2, new Map([
  ["Pseudo0", function Pseudo0(Opcode, Argument, LabelToWordOffset){
    const Match = /^((-?\d+)|(\$[0-9a-f]+)|([a-zA-Z][a-z_A-Z0-9]*))(\[R(\d+)\])?$/.exec(Argument);
    if(Match === null) throw new Error(`X-format instruction wasn't formatted properly.`);
    const ImmediateOffset = ResolveImmediateValue(Match[2], Match[3], Match[4], LabelToWordOffset);
    const OffsetRegisterID = Number.parseInt(Match[6] || "0");
    return [0xf << 12 | Opcode << 8 | OffsetRegisterID << 4 | 4, ImmediateOffset];
  }],
  ["Pseudo1", function Pseudo1(Opcode, Argument, LabelToWordOffset){
    const Match = /^((-?\d+)|(\$[0-9a-f]+)|([a-zA-Z][a-z_A-Z0-9]*))(\[R(\d+)\])?$/.exec(Argument);
    if(Match === null) throw new Error(`X-format instruction wasn't formatted properly.`);
    const ImmediateOffset = ResolveImmediateValue(Match[2], Match[3], Match[4], LabelToWordOffset);
    const OffsetRegisterID = Number.parseInt(Match[6] || "0");
    return [0xf << 12 | Opcode << 8 | OffsetRegisterID << 4 | 5, ImmediateOffset];
  }]
]));

export const EPseudoRX = new InstructionType(x => x + 4, new Map([
  ["Pseudo0", function Pseudo0(Opcode, Argument, LabelToWordOffset){
    const Match = /^((-?\d+)|(\$[0-9a-f]+)|([a-zA-Z][a-z_A-Z0-9]*))(\[R(\d+)\])?$/.exec(Argument);
    if(Match === null) throw new Error(`X-format instruction wasn't formatted properly.`);
    const ImmediateOffset = ResolveImmediateValue(Match[2], Match[3], Match[4], LabelToWordOffset, true);
    const OffsetRegisterID = Number.parseInt(Match[6] || "0");
    return [0xd000, 0xf << 12 | Opcode << 8 | OffsetRegisterID << 4 | 4, ImmediateOffset & 65535, ImmediateOffset >> 16];
  }],
  ["Pseudo1", function Pseudo1(Opcode, Argument, LabelToWordOffset){
    const Match = /^((-?\d+)|(\$[0-9a-f]+)|([a-zA-Z][a-z_A-Z0-9]*))(\[R(\d+)\])?$/.exec(Argument);
    if(Match === null) throw new Error(`X-format instruction wasn't formatted properly.`);
    const ImmediateOffset = ResolveImmediateValue(Match[2], Match[3], Match[4], LabelToWordOffset, true);
    const OffsetRegisterID = Number.parseInt(Match[6] || "0");
    return [0xd000, 0xf << 12 | Opcode << 8 | OffsetRegisterID << 4 | 5, ImmediateOffset & 65535, ImmediateOffset >> 16];
  }]
]));

export const EXP = new InstructionType(x => x + 2, new Map([
  ["X", function X(Opcode, Argument, LabelToWordOffset){
    const Match = /^((-?\d+)|(\$[0-9a-f]+)|([a-zA-Z][a-z_A-Z0-9]*))?$/.exec(Argument);
    if(Match === null) throw new Error(`X-format instruction wasn't formatted properly.`);
    const ImmediateOffset = ResolveImmediateValue(Match[2], Match[3], Match[4], LabelToWordOffset);
    return [0xe000 | Opcode, ImmediateOffset];
  }],
  ["RX", function RX(Opcode, Argument, LabelToWordOffset){
    const Match = /^R(\d+),((-?\d+)|(\$[0-9a-f]+)|([a-zA-Z][a-z_A-Z0-9]*))?$/.exec(Argument);
    if(Match === null) throw new Error(`RX-format instruction wasn't formatted properly.`);
    const RegisterID = Number.parseInt(Match[1] || "0") & 15;
    const ImmediateOffset = ResolveImmediateValue(Match[3], Match[4], Match[5], LabelToWordOffset);
    return [0xe000 | RegisterID << 8 | Opcode, ImmediateOffset];
  }],
  ["RXX", function RXX(Opcode, Argument, LabelToWordOffset){
    const Match = /^R(\d+),((-?\d+)|(\$[0-9a-f]+)|([a-zA-Z][a-z_A-Z0-9]*)),((-?\d+)|(\$[0-9a-f]+)|([a-zA-Z][a-z_A-Z0-9]*))?$/.exec(Argument);
    if(Match === null) throw new Error(`RXX-format instruction wasn't formatted properly.`);
    const RegisterID = Number.parseInt(Match[1] || "0") & 15;
    const ImmediateOffset1 = ResolveImmediateValue(Match[3], Match[4], Match[5], LabelToWordOffset) & 15;
    const ImmediateOffset2 = ResolveImmediateValue(Match[7], Match[8], Match[9], LabelToWordOffset) & 4095;
    return [0xe000 | RegisterID << 8 | Opcode, ImmediateOffset1 << 12 | ImmediateOffset2];
  }],
  ["RRXR", function RRXR(Opcode, Argument, LabelToWordOffset){
    const Match = /^R(\d+),R(\d+),((-?\d+)|(\$[0-9a-f]+)|([a-zA-Z][a-z_A-Z0-9]*))(\[R(\d+)\])?$/.exec(Argument);
    if(Match === null) throw new Error(`RRXR-format instruction wasn't formatted properly.`);
    const RegisterID1 = Number.parseInt(Match[1] || "0") & 15;
    const RegisterID2 = Number.parseInt(Match[2] || "0") & 15;
    const RegisterID3 = Number.parseInt(Match[8] || "0") & 15;
    const ImmediateOffset = ResolveImmediateValue(Match[4], Match[5], Match[6], LabelToWordOffset) & 255;
    return [0xe000 | RegisterID1 << 8 | Opcode, RegisterID2 << 12 | RegisterID3 << 8 | ImmediateOffset];
  }],
  ["R", function R(Opcode, Argument, LabelToWordOffset){
    const Match = /^R(\d+)$/.exec(Argument);
    if(Match === null) throw new Error(`R-format instruction wasn't formatted properly.`);
    const RegisterID = Number.parseInt(Match[1] || "0") & 15;
    return [0xe000 | RegisterID << 8 | Opcode, 0];
  }],
]));

export const Data = new InstructionType(x => x + 1, new Map([
  ["X", function X(Opcode, Argument, LabelToWordOffset){
    const Match = /^((-?\d+)|(\$[0-9a-f]+)|([a-zA-Z][a-z_A-Z0-9]*))$/.exec(Argument);
    if(Match === null) throw new Error(`Data instruction wasn't formatted properly.`);
    const Data = ResolveImmediateValue(Match[2], Match[3], Match[4], LabelToWordOffset);
    return [Data];
  }]
]));



export const Instructions = new Map([
  ["add", [RRR, , "RRR", 0]],
  ["sub", [RRR, , "RRR", 1]],
  ["mul", [RRR, , "RRR", 2]],
  ["div", [RRR, , "RRR", 3]],
  ["cmp", [RRR, , "RR", 4]],
  ["addc", [RRR, , "RRR", 5]],
  ["muln", [RRR, , "RRR", 6]],
  ["divn", [RRR, , "RRR", 7]],
  ["trap", [RRR, , "RRR", 12]],
  ["adde", [ERRR, , "RRR", 0]],
  ["sube", [ERRR, , "RRR", 1]],
  ["mule", [ERRR, , "RRR", 2]],
  ["dive", [ERRR, , "RRR", 3]],
  ["cmpe", [ERRR, , "RR", 4]],
  ["addce", [ERRR, , "RRR", 5]],
  ["mulne", [ERRR, , "RRR", 6]],
  ["divne", [ERRR, , "RRR", 7]],
  ["lea", [RX, , "RRX", 0]],
  ["load", [RX, , "RRX", 1]],
  ["store", [RX, , "RRX", 2]],
  ["jump", [RX, , "X", 3]],
  ["jumpc0", [RX, , "KRX", 4]],
  ["jumpc1", [RX, , "KRX", 5]],
  ["jumple", [PseudoRX, , "Pseudo0", 0]],
  ["jumpgt", [PseudoRX, , "Pseudo1", 0]],
  ["jumpne", [PseudoRX, , "Pseudo0", 2]],
  ["jumpeq", [PseudoRX, , "Pseudo1", 2]],
  ["jumpge", [PseudoRX, , "Pseudo0", 4]],
  ["jumplt", [PseudoRX, , "Pseudo1", 4]],
  ["jal", [RX, , "RRX", 6]],
  ["tstset", [RX, , "RRX", 11]],
  ["leae", [ERX, , "RRX", 0]],
  ["loade", [ERX, , "RRX", 1]],
  ["storee", [ERX, , "RRX", 2]],
  ["jumpe", [ERX, , "X", 3]],
  ["jumpc0e", [ERX, , "KRX", 4]],
  ["jumpc1e", [ERX, , "KRX", 5]],
  ["jumplee", [EPseudoRX, , "Pseudo0", 0]],
  ["jumpgte", [EPseudoRX, , "Pseudo1", 0]],
  ["jumpnee", [EPseudoRX, , "Pseudo0", 2]],
  ["jumpeqe", [EPseudoRX, , "Pseudo1", 2]],
  ["jumpgee", [EPseudoRX, , "Pseudo0", 4]],
  ["jumplte", [EPseudoRX, , "Pseudo1", 4]],
  ["jale", [ERX, , "RRX", 6]],
  ["brf", [EXP, , "X", 0]],
  ["brb", [EXP, , "X", 1]],
  ["brfc0", [EXP, , "RXX", 2]],
  ["brbc0", [EXP, , "RXX", 3]],
  ["brfc1", [EXP, , "RXX", 4]],
  ["brbc1", [EXP, , "RXX", 5]],
  ["brfz", [EXP, , "RX", 6]],
  ["brbz", [EXP, , "RX", 7]],
  ["brfnz", [EXP, , "RX", 8]],
  ["brbnz", [EXP, , "RX", 9]],
  ["dsptch", [EXP, , "RXX", 10]],
  ["save", [EXP, , "RRXR", 11]],
  ["restor", [EXP, , "RRXR", 12]],
  ["memsize", [EXP, , "R", 255]],
  ["data", [Data, , "X", 0]]
]);
for(const [Name, Info] of Instructions){
  const [Type, _, Afmt, ID] = Info;
  Info[1] = Type.AfmtParsers.get(Afmt).bind(null, ID);
}

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