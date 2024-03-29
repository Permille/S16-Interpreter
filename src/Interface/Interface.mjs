import "./index.html?copy";
import "./Main.css";
import "./Header.css";
import "./Scrollbars.css";
import "./General.css";
import "./ErrorMessage.css";
import WelcomeTab from "./Tabs/WelcomeTab.mjs";
import EditorTab from "./Tabs/EditorTab.mjs";
import StateTab from "./Tabs/StateTab.mjs";
import InterpreterTab from "./Tabs/InterpreterTab.mjs";
//import StatisticsTab from "./Tabs/StatisticsTab.mjs";
//import SettingsTab from "./Tabs/SettingsTab.mjs";
import FeedbackWindow from "./Windows/FeedbackWindow.mjs";
import ComparisonWithCWindow from "./Windows/ComparisonWithCWindow.mjs";

export default class Interface{
  constructor(){
    this.Tabs = new Map([
      ["Welcome", new WelcomeTab(document.getElementById("WelcomeTabButton"), document.getElementById("WelcomeTab"))],
      ["Editor", new EditorTab(document.getElementById("EditorTabButton"), document.getElementById("EditorTab"))],
      ["Interpreter", new InterpreterTab(document.getElementById("InterpreterTabButton"), document.getElementById("InterpreterTab"))],
      ["State", new StateTab(document.getElementById("StateTabButton"), document.getElementById("StateTab"))],
      //["Statistics", new StatisticsTab(document.getElementById("StatisticsTabButton"), document.getElementById("StatisticsTab"))],
      //["Settings", new SettingsTab(document.getElementById("SettingsTabButton"), document.getElementById("SettingsTab"))]
    ]);
    this.Tabs.get("Welcome").Show();

    //["ImportTab", new ImportTab(document.getElementById("ImportTabButton"), document.getElementById("ImportTab"))],

    this.Initialise();
  }
  async Initialise(){
    await window.LoadedPromise;
    window.Main.Interpreter.Events.addEventListener("Error", function(Event){
      console.log(Event);
      this.ShowError(Event.detail);
    }.bind(this));

    const OpenFileButton = document.getElementById("OpenFileButton");
    const SaveFileButton = document.getElementById("SaveFileButton");
    //const LoadStateButton = document.getElementById("LoadStateButton");
    //const SaveStateButton = document.getElementById("SaveStateButton");

    //TODO: these handlers leak the input element
    OpenFileButton.addEventListener("click", function(){
      const Element = document.createElement("input");
      Element.setAttribute("type", "file");
      Element.addEventListener("input", async function(Event){
        if(!Event.target.files.length === 0) return;
        const File = Event.target.files[0];
        const Text = await File.text();
        this.Tabs.get("Editor").SetText(Text);
      }.bind(this));
      Element.click();
    }.bind(this));
    SaveFileButton.addEventListener("click", function(){
      this.Tabs.get("Editor").Download(Text);
    }.bind(this));
    /*LoadStateButton.addEventListener("click", function(){
      const Element = document.createElement("input");
      Element.setAttribute("type", "file");
      Element.addEventListener("input", async function(Event){
        if(!Event.target.files.length === 0) return;
        const File = Event.target.files[0];
        const Buffer = await File.arrayBuffer();
        if(Buffer.byteLength !== 131072 + 128){
          this.ShowError("Snapshot file doesn't have the correct size.");
          return;
        }
        Main.Interpreter.SetMemory(Buffer);
      }.bind(this));
      Element.click();
    }.bind(this));
    SaveStateButton.addEventListener("click", async function(){
      const file = new Blob([new Uint8Array(await Main.Interpreter.GetMemory())], {"type": "application/octet-stream"});
      const element = document.createElement("a");
      const url = URL.createObjectURL(file);
      element.href = url;
      element.download = `Snapshot_${(new Date).toISOString()}.bin`;
      element.click();
    }.bind(this));*/

    const FeedbackButton = document.getElementById("FeedbackButton");
    FeedbackButton.addEventListener("click", function(){
      new FeedbackWindow;
    });
    const ComparisonWithCButton = document.getElementById("ComparisonWithCButton");
    ComparisonWithCButton.addEventListener("click", function(){
      new ComparisonWithCWindow;
    });
  }
  ShowError(Message){
    const Element = document.createElement("div");
    Element.innerText = Message;
    Element.classList.add("ErrorMessage");
    Element.style.bottom = "-200px";
    window.setTimeout(function(){
      Element.style.transition = "bottom 1s cubic-bezier(0, 0.65, 0.47, 0.96)";
      window.setTimeout(function(){
        Element.style.bottom = "20px";
      }, 100);
    }, 50);
    document.body.append(Element);
    window.setTimeout(function(){
      Element.style.transition = "bottom 1s cubic-bezier(0.42, 0, 1, 0.26)";
      Element.style.bottom = "-200px";
      window.setTimeout(function(){
        Element.remove();
      }, 1500);
    }, 3000);
  }
};