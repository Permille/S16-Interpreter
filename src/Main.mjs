import "./Interface/Interface.mjs";
import Interface from "./Interface/Interface.mjs";
import Interpreter from "./Interpreter/Interpreter.mjs";
import DeferredPromise from "./DeferredPromise.mjs";

class Main{
  static{
    window.onload = function(){
      window.LoadedPromise = new DeferredPromise;
      window.Main = new Main;
    };
  }
  constructor(){
    this.Interface = new Interface;
    this.Interpreter = new Interpreter;
    window.LoadedPromise.resolve();
  }
}