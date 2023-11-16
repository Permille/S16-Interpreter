import DeferredPromise from "../DeferredPromise.mjs";
export default class Interpreter{
  constructor(){
    this.Events = new EventTarget;
    this.RequestID = 0;
    this.Requests = new Map;
    this.Worker = null;
    this.InitialiseWorker();
  }
  InitialiseWorker(){
    this.Worker = new Worker(new URL("./Worker.mjs", import.meta.url), {"name": "Worker", "type": "module"});
    this.Worker.onmessage = function(Event){
      const ID = Event.data.ID;
      const Failed = Event.data.Failed;

      if(!this.Requests.has(ID)) throw new Error(`Handler with ID ${ID} doesn't exist.`);
      const Handler = this.Requests.get(ID);

      if(Failed) Handler.reject(Event);
      else Handler.resolve(Event);

      this.Requests.delete(ID);
    }.bind(this);
    this.Worker.onerror = function(Event){
      this.Events.dispatchEvent(new CustomEvent("Error", {"detail": "Internal error: \n" + Event.message}));
    }.bind(this);
  }
  TerminateWorker(){
    this.Requests.forEach(Handler => Handler.reject());
    this.Requests.clear();
    this.Worker.terminate();
    this.Worker = null;
  }
  MessageWorker(Request, Message){
    const ResponsePromise = new DeferredPromise;
    const ID = this.RequestID++;
    this.Requests.set(ID, ResponsePromise);
    this.Worker.postMessage({Request, ID, Message});
    return ResponsePromise;
  }
  async Compile(Text){
    try{
      const Result = await this.MessageWorker("Compile", Text);
    }
    catch(Error){
      this.Events.dispatchEvent(new CustomEvent("Error", {"detail": "Internal error: \n" + Error.data.ErrorMessage}));
    }
  }
  async Run(Iterations){
    const Result = await this.MessageWorker("Run", Iterations);
    switch(Result.data.Code){
      case 0:{
        //Yielded (finished executing the amount of iterations specified)
        this.Events.dispatchEvent(new CustomEvent("Yield"));
        break;
      }
      case 1:{
        //Stopped
        this.Events.dispatchEvent(new CustomEvent("Stop"));
        break;
      }
      case 2:{
        //Breakpoint
        this.Events.dispatchEvent(new CustomEvent("Breakpoint"));
      }
      default:{
        throw new Error("Unknown result code from interpreter: " + Result.data.Code);
      }
    }
  }
  async Reset(){
    const Result = await this.MessageWorker("Reset");
  }
};