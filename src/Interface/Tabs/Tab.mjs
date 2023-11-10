import WindowFrame from "../WindowFrame/WindowFrame.mjs";
import {AddEventListener, FireEvent, RemoveEventListener} from "../../Events.mjs";
export default class Tab{
  constructor(Button, Body){
    this.Button = Button;
    this.Body = Body;
    this.Events = new EventTarget;
    this.IsMouseDown = false;

    this.Button.addEventListener("click", this.Show.bind(this));
    this.Button.addEventListener("mousedown", function(){
      this.IsMouseDown = true;
    }.bind(this));
    window.addEventListener("mouseup", function(){
      this.IsMouseDown = false;
    }.bind(this));
    this.Button.addEventListener("mouseleave", function(Event){
      if(!this.IsMouseDown) return;
      this.IsMouseDown = false;
      if(Event.clientY < 25) return;
      if(this.Button.classList.contains("Active")) return;
      console.log(Event);
      const Window = new WindowFrame(500, 200);
      Window.SetTitle(this.Button.innerText);
      Window.SetPosition(Event.clientX - Window.Width / 2., Event.clientY);
      this.Button.style.display = "none";
      const OldParentElement = this.Body.parentElement;
      Window.BodyElement.appendChild(this.Body);
      Window.Dragging = true;
      AddEventListener(Window.Events, "Close", function(Event){
        OldParentElement.appendChild(this.Body);
        this.Button.style.display = "block";
      }.bind(this));
    }.bind(this));
  }
  Show(){
    const CurrentlyActiveElement = document.querySelector("main > div");
    if(CurrentlyActiveElement !== null){
      const CurrentlyActiveID = CurrentlyActiveElement.getAttribute("id");
      document.getElementById(CurrentlyActiveID + "Button").classList.remove("Active");
      document.getElementById("UnusedTabs").appendChild(CurrentlyActiveElement);
    }
    document.querySelector("main").appendChild(this.Body);
    this.Button.classList.add("Active");
  }
};