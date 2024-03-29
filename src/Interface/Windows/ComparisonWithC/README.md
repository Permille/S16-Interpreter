# Prototype interpreter implementation in C

This folder contains the prototype implementation in C that was used to compare the performance of an implementation written in C, against one written in WAT. To compile, it is necessary to install LLVM, and run the Compile.bat batch stript (or equivalent set of commands). Then, it is necessary to make sure that the webpack build was recompiled and uses the new binary. Note that the wasm binary is not recompiled automatically! For ease of use, a binary precompiled with LLVM version 17.0.1 is provided as Main.wasm, and was the one used in the evaluation of the project.

## Implementation status

This version implements all RRR instructions except trap, and implements the lea and jump RX instructions.