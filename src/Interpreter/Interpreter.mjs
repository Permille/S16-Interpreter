import DeferredPromise from "../DeferredPromise.mjs";
export default class Interpreter{
  constructor(){
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
    const Result = await this.MessageWorker("Compile", Text);
  }
  async Run(Iterations){
    const Result = await this.MessageWorker("Run", Iterations);
  }
  async Reset(){
    const Result = await this.MessageWorker("Reset");
  }
};