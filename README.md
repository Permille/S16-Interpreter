# SigmaPlus16

This is the repository containing all source files for SigmaPlus16.

## Dependencies

This project uses node.js and the npm package manager. Optionally, for recompiling the C binary to WebAssembly, it it is necessary to install LLVM.

## Features

- Faster code execution
- 32-bit extension
- Improved user interface

## How to build

To setup the node libraries, when first running the project, it is necessary to run the command `npm i`.

### Development

For development, use the command `npm run server`. This creates a development server from which the compiled project can be loaded, and the project recompiles automatically after code save (similar to `nodemon`).

### Production

It is possible to run `npm run build-prod`, which creates a size-optimised compiled project suitable for production deployment.

## Online demo

An online demo of this project can be found on https://permille.io/Sigma16 .