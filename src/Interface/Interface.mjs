import "./index.html?copy";
import "./Main.css";
import "./Header.css";
import "./Scrollbars.css";
import "./General.css";
import WelcomeTab from "./Tabs/WelcomeTab.mjs";
import EditorTab from "./Tabs/EditorTab.mjs";
import ConsoleTab from "./Tabs/ConsoleTab.mjs";
import InterpreterTab from "./Tabs/InterpreterTab.mjs";
import MemoryViewerTab from "./Tabs/MemoryViewerTab.mjs";
import StatisticsTab from "./Tabs/StatisticsTab.mjs";
import SettingsTab from "./Tabs/SettingsTab.mjs";

export default class Interface{
  constructor(){
    this.Tabs = new Map([
      ["Welcome", new WelcomeTab(document.getElementById("WelcomeTabButton"), document.getElementById("WelcomeTab"))],
      ["Editor", new EditorTab(document.getElementById("EditorTabButton"), document.getElementById("EditorTab"))],
      ["Console", new ConsoleTab(document.getElementById("ConsoleTabButton"), document.getElementById("ConsoleTab"))],
      ["Interpreter", new InterpreterTab(document.getElementById("InterpreterTabButton"), document.getElementById("InterpreterTab"))],
      ["MemoryViewer", new MemoryViewerTab(document.getElementById("MemoryViewerTabButton"), document.getElementById("MemoryViewerTab"))],
      ["Statistics", new StatisticsTab(document.getElementById("StatisticsTabButton"), document.getElementById("StatisticsTab"))],
      ["Settings", new SettingsTab(document.getElementById("SettingsTabButton"), document.getElementById("SettingsTab"))]
    ]);
    this.Tabs.get("Welcome").Show();
  }
};