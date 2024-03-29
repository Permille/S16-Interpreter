import { RRR, RX, EXP, Instructions } from "../Interpreter/Compile.mjs";

export default function HexLineNumbers(GetText){
  let LastText = "";
  let LineOffsets = [];
  const GenerateLineOffsets = function(Text){
    LastText = Text;
    LineOffsets.length = 0;
    const Lines = Text.split(/[\r\n]/);
    let Offset = 0;
    for(let i = 0; i < Lines.length; ++i){
      LineOffsets.push(Offset);
      if(/^\s*;;/.test(Lines[i])) continue;
      const Parts = Lines[i].split(/\s+/);
      if(Parts.length <= 1) continue;
      const Instruction = Parts[1];
      if(!Instructions.has(Instruction)) continue;
      const [InstructionType] = Instructions.get(Instruction);
      Offset = InstructionType.GetNextOffset(Offset);
    }
    LineOffsets.push(Offset);
  };
  return function(Line){
    const NewText = GetText();
    if(NewText !== LastText) GenerateLineOffsets(NewText);
    return LineOffsets[Math.min(LineOffsets.length, Line)];
  };
};