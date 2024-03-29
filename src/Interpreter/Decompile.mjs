import { RRR, RX, EXP, Instructions } from "./Compile.mjs";
export const CodeToRRR = new Map;
export const CodeToRX = new Map;
export const CodeToEXP = new Map;
for(const [Name, [Type, Compiler, Afmt, Code]] of Instructions){
  if(Type === RRR) CodeToRRR.set(Code, [Name, Afmt]);
  else if(Type === RX) CodeToRX.set(Code, [Name, Afmt]);
  else if(Type === EXP) CodeToEXP.set(Code, [Name, Afmt]);
}

const RRRDecompilers = new Map([
  ["RRR", function(Data, Index){
    const d = Data[Index] >> 8 & 15;
    const a = Data[Index] >> 4 & 15;
    const b = Data[Index] >> 0 & 15;
    return `R${d},R${a},R${b}`;
  }],
  ["RR", function(Data, Index){
    const a = Data[Index] >> 4 & 15;
    const b = Data[Index] >> 0 & 15;
    return `R${a},R${b}`;
  }]
]);
const RXDecompilers = new Map([
  ["RRX", function(Data, Index){
    const a = Data[Index] >> 8 & 15;
    const b = Data[Index] >> 4 & 15;
    const Offset = Data.length === Index ? "????" : Data[Index + 1] + "";
    return `R${a},${Offset}[R${b}]`;
  }],
  ["X", function(Data, Index){
    const a = Data[Index] >> 8 & 15;
    const b = Data[Index] >> 4 & 15;
    const Offset = Data.length === Index ? "????" : Data[Index + 1] + "";
    return `${Offset}[R${b}]`;
  }],
  ["KRX", function(Data, Index){
    const a = Data[Index] >> 8 & 15;
    const b = Data[Index] >> 4 & 15;
    const Offset = Data.length === Index ? "????" : Data[Index + 1] + "";
    return `${a},${Offset}[R${b}]`;
  }]
]);

export default function Decompile(Data){
  const Lines = [];
  for(let i = 0; i < Data.length; ++i){
    const Hex = "0x" + Data[i].toString(16).padStart(4, "0");
    const RRRCode = Data[i] >> 12 & 15;
    if(RRRCode === 15){
      //RX
      const RXCode = Data[i] & 15;
      if(!CodeToRX.has(RXCode)){
        Lines.push(`;; Unknown RX instruction: ${Hex}`);
        continue;
      }
      const [Name, Afmt] = CodeToRX.get(RXCode);
      Lines.push(` ${Name} ${RXDecompilers.get(Afmt)(Data, i)}`);
    } else if(RRRCode === 14){
      //EXP
      Lines.push(`;; Unknown EXP instruction: ${Hex}`);
    } else if(RRRCode === 13){
      Lines.push(" 32Bit");
    } else{
      //RRR
      if(!CodeToRRR.has(RRRCode)){
        Lines.push(`;; Unknown RRR instruction: ${Hex}`);
        continue;
      }
      const [Name, Afmt] = CodeToRRR.get(RRRCode);
      Lines.push(` ${Name} ${RRRDecompilers.get(Afmt)(Data, i)}`);
    }
  }
  return Lines;
}