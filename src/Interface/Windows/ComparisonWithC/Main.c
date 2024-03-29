#include <stdint.h>
typedef int8_t i8;
typedef int16_t i16;
typedef int32_t i32;
typedef uint8_t u8;
typedef uint16_t u16;
typedef uint32_t u32;
u16 Memory[65536];
u16 Registers[16];
u16 InstructionAddress = 0;

void SetRegister(int ID, u16 Value){
  if(ID != 0) Registers[ID] = Value;
}
u16 GetRegister(int ID){
	return ID != 0 ? Registers[ID] : 0;
}

void SetMemory(int i, u16 Value){
	Memory[i] = Value;
}

u16 GetMemory(int i, u16 Value){
	return Memory[i];
}

void Initialise(){
	__builtin_wasm_memory_grow(0, 2);
}
void Reset(){
	for(int i = 0; i < 16; ++i) SetRegister(i, 0);
	InstructionAddress = 0;
}


void I_Add(u16 Destination, u16 RegisterA, u16 RegisterB){
	u32 a = GetRegister(RegisterA);
	u32 b = GetRegister(RegisterB);
	u32 Sum = a + b;
	u32 Primary = Sum & 0xffff;
	u32 msba = a >> 15;
	u32 msbb = b >> 15;
	u32 msbsum = Primary >> 15;
	u32 CarryOut = Sum >> 16;
	u32 tcOverflow = (!msba && !msbb && msbsum) || (msba && msbb && !msbsum);
	SetRegister(15, 
		CarryOut * 192 |
		tcOverflow << 5 |
		!Primary << 2 |
		Sum != 0 << 1 |
		!(msbsum || tcOverflow) |
		(!tcOverflow && msbsum) << 4
	);
	SetRegister(Destination, Primary);
}
void I_Sub(u16 Destination, u16 RegisterA, u16 RegisterB){
	u32 a = GetRegister(RegisterA);
	u32 b = GetRegister(RegisterB);
	u32 Primary = (a - b) & 0xffff;
	u32 msba = a >> 15;
	u32 msbb = b >> 15;
	u32 msbsum = Primary >> 15;
	u32 tcOverflow = (!msba && !msbb && msbsum) || (msba && msbb && !msbsum);

	SetRegister(15, 
		(a > b) * 192 |
		tcOverflow << 5 |
		!Primary << 2 |
		2 |
		!(msbsum || tcOverflow) |
		(!tcOverflow && msbsum) << 4
	);
	SetRegister(Destination, Primary);
}
void I_Mul(u16 d, u16 a, u16 b){
	u32 Product = (u32)GetRegister(a) * (u32)GetRegister(b);
	SetRegister(15, (Product > 32767) << 5);
	SetRegister(d, Product);
}
void I_Div(u16 Destination, u16 RegisterA, u16 RegisterB){
	u16 a = GetRegister(RegisterA);
	u16 b = GetRegister(RegisterB);

	if(b){
		SetRegister(15, a % b);
		SetRegister(Destination, (u16)/*floorf*/((float)(i16)a / (float)(i16)b));
	} else{
		SetRegister(15, 0);
		SetRegister(Destination, 0);
	}
}
void I_Cmp(u16 d, u16 a, u16 b){
	u16 A = GetRegister(a);
	u16 B = GetRegister(b);
	SetRegister(15, 
		(A == B) << 2 |
		(A < B) << 3 |
		(A > B) << 1 |
		((i16)A < (i16)B) << 4 |
		((i16)A > (i16)B)
	);
}
void I_Addc(u16 Destination, u16 RegisterA, u16 RegisterB){
	u32 a = GetRegister(RegisterA);
	u32 b = GetRegister(RegisterB);
	u32 Sum = a + b + ((GetRegister(15) >> 7) & 1);
	u32 Primary = Sum & 0xffff;
	u32 msba = a >> 15;
	u32 msbb = b >> 15;
	u32 msbsum = Primary >> 15;
	u32 CarryOut = Sum >> 16;
	u32 tcOverflow = (!msba && !msbb && msbsum) || (msba && msbb && !msbsum);
	SetRegister(15, 
		CarryOut * 192 |
		tcOverflow << 5 |
		!Primary << 2 |
		Sum != 0 << 1 |
		!(msbsum || tcOverflow) |
		(!tcOverflow && msbsum) << 4
	);
	SetRegister(Destination, Primary);
}
void I_Muln(u16 d, u16 a, u16 b){
	u32 Product = (u32)GetRegister(a) * (u32)GetRegister(b);
	SetRegister(15, Product >> 16);
	SetRegister(d, Product);
}
void I_Divn(u16 d, u16 a, u16 b){
	u16 B = GetRegister(b);
	if(B != 0){
		u32 A = GetRegister(a);
		u32 F = GetRegister(15);
		u32 Dividend = F << 16 | A;
		u32 Quotient = Dividend / B;
		SetRegister(15, Quotient);
		SetRegister(d, Quotient >> 16);
		SetRegister(a, Quotient % B);
	} else{
		SetRegister(15, 0);
		SetRegister(d, 0);
		SetRegister(a, 0);
	}
}
void I_Lea(u16 d, u16 a, u16 i){
	SetRegister(d, GetRegister(a) + i);
}
void I_Jump(u16 d, u16 a, u16 i){
	InstructionAddress = GetRegister(a) + i;
}


void Run(int MaxIterations){
	InstructionAddress = 0;
	while(MaxIterations --> 0){
		u16 Instruction = Memory[InstructionAddress];
		InstructionAddress++;
		u16 Code = Instruction >> 12;
		u16 Destination = Instruction >> 8 & 15;
		u16 ParameterA = Instruction >> 4 & 15;
		u16 ParameterB = Instruction & 15;

		switch(Code){
			case 0: I_Add(Destination, ParameterA, ParameterB); break;
			case 1: I_Sub(Destination, ParameterA, ParameterB); break;
			case 2: I_Mul(Destination, ParameterA, ParameterB); break;
			case 3: I_Div(Destination, ParameterA, ParameterB); break;
			case 4: I_Cmp(Destination, ParameterA, ParameterB); break;
			case 5: I_Addc(Destination, ParameterA, ParameterB); break;
			case 6: I_Muln(Destination, ParameterA, ParameterB); break;
			case 7: I_Divn(Destination, ParameterA, ParameterB); break;
			case 8: break;
			case 9: break;
			case 10: break;
			case 11: break;
			case 12: break;
			case 13: break;
			case 14: break;
			case 15: {
				int ImmediateOperand = Memory[InstructionAddress];
				InstructionAddress++;
				switch(ParameterB){
					case 0: I_Lea(Destination, ParameterA, ImmediateOperand); break;
					case 3: I_Jump(Destination, ParameterA, ImmediateOperand); break;
				}
				break;
			}
		}
	}
}
u32 GetMemoryAddress(){
	return (u32)&Memory;
}
u16 GetInstructionAddress(){
	return InstructionAddress;
}

/*
int16_t add(int16_t a, int16_t b){
	((int*)0)[200] = 45;
	return a + b;
}
*/