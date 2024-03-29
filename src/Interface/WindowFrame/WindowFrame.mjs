import "./style.css";

import {AddEventListener, FireEvent, RemoveEventListener} from "../../Events.mjs";
export default class WindowFrame{
  static CurrentZIndex = 1;
  constructor(Width, Height, StrictDimensions){
    this.IsDestroyed = false;
    this.Events = new EventTarget;

    this.Element = document.createElement("div");
    this.Element.classList.add("WindowWrapper");
    document.body.appendChild(this.Element);
    const Wrapper = document.createElement("div");
    this.Element.appendChild(Wrapper);
    this.TitleBarElement = document.createElement("div");
    this.TitleBarElement.classList.add("TitleBar");
    Wrapper.appendChild(this.TitleBarElement);
    this.BodyElement = document.createElement("div");
    this.BodyElement.classList.add("Body");
    Wrapper.appendChild(this.BodyElement);
    this.TitleTextElement = document.createElement("div");
    this.TitleTextElement.classList.add("TitleText");
    this.TitleBarElement.appendChild(this.TitleTextElement);
    this.CloseElement = document.createElement("img");
    this.CloseElement.classList.add("CloseImage");
    this.CloseElement.setAttribute("src", "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBoZWlnaHQ9IjUwMCIgd2lkdGg9IjEwMDAiIHZlcnNpb249IjEuMSI+DQogIDxwYXRoIGQ9Ig0KICAgIE0gNDAwIDI1MA0KCUwgNTAwIDE1MA0KCUwgNjAwIDI1MA0KCU0gNTAwIDE3NQ0KCUwgNTAwIDQyNQ0KCU0gMzUwIDEwMA0KCUwgNjUwIDEwMA0KICAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSI0MCIgLz4NCjwvc3ZnPg==");
    this.TitleBarElement.appendChild(this.CloseElement);

    this.PositionX = 0;
    this.PositionY = 0;
    this.Width = Width;
    this.Height = Height;
    this.StrictDimensions = StrictDimensions;
    this.SetPosition(this.PositionX, this.PositionY);
    this.SetDimensions(this.Width, this.Height);
    this.Dragging = false;
    this.Resizing = false;
    this.ResizeDirection = [0, 0];

    this.EventIDs = [
      AddEventListener(this.Element, "mousemove", function(Event){
        if(this.Resizing || this.Dragging) return;
        const Rect = this.Element.getBoundingClientRect();
        const X = Event.clientX - 8 - Rect.left;
        const Y = Event.clientY - 8 - Rect.top;
        const SideX = X < 0 ? 15 : X > this.Element.clientWidth - 16 ? 1 : 0;
        const SideY = Y < 0 ? 15 : Y >= this.Element.clientHeight - 16 ? 1 : 0;
        switch(SideY << 4 | SideX){
          case 0xf0: this.Element.style.cursor = "n-resize"; break;
          case 0xf1: this.Element.style.cursor = "ne-resize"; break;
          case 0x01: this.Element.style.cursor = "e-resize"; break;
          case 0x11: this.Element.style.cursor = "se-resize"; break;
          case 0x10: this.Element.style.cursor = "s-resize"; break;
          case 0x1f: this.Element.style.cursor = "sw-resize"; break;
          case 0x0f: this.Element.style.cursor = "w-resize"; break;
          case 0xff: this.Element.style.cursor = "nw-resize"; break;
          default: this.Element.style.cursor = "unset"; break;
        }
      }.bind(this)),
      AddEventListener(this.Element, "mouseleave", function(Event){
        this.Element.style.cursor = "unset";
      }.bind(this)),
      AddEventListener(this.TitleBarElement, "mousedown", function(Event){
        Event.preventDefault();
        this.Dragging = true;
      }.bind(this)),
      AddEventListener(window, "mousemove", function(Event){
        if(this.Dragging){
          Event.preventDefault();
          const CheckedMovementX = Event.clientX >= 0 && Event.clientX < window.innerWidth ? Event.movementX / window.devicePixelRatio : 0;
          const CheckedMovementY = Event.clientY >= 0 && Event.clientY < window.innerHeight ? Event.movementY / window.devicePixelRatio : 0;
          this.ApplyMovement(CheckedMovementX, CheckedMovementY);
        } else if(this.Resizing){
          Event.preventDefault();
          const CheckedMovementX = Event.clientX >= 0 && Event.clientX < window.innerWidth ? Event.movementX / window.devicePixelRatio : 0;
          const CheckedMovementY = Event.clientY >= 0 && Event.clientY < window.innerHeight ? Event.movementY / window.devicePixelRatio : 0;
          const OldWidth = this.Width;
          const OldHeight = this.Height;
          this.SetDimensions(OldWidth + this.ResizeDirection[0] * CheckedMovementX, OldHeight + this.ResizeDirection[1] * CheckedMovementY);
          this.SetPosition(this.PositionX + (this.ResizeDirection[0] === -1 ? OldWidth - this.Width : 0), this.PositionY + (this.ResizeDirection[1] === -1 ? OldHeight - this.Height : 0));
        }
      }.bind(this)),
      AddEventListener(window, "mouseup", function(Event){
        if(this.Dragging){
          Event.preventDefault();
          this.Dragging = false;
        } else if(this.Resizing){
          this.Resizing = false;
          document.documentElement.style.cursor = "auto";
        }
      }.bind(this)),
      AddEventListener(window, "resize", function(Event){
        this.SetPosition(this.PositionX, this.PositionY);
      }.bind(this)),
      AddEventListener(this.Element, "mousedown", function(Event){
        this.Element.style.zIndex = "" + WindowFrame.CurrentZIndex++;
        if(Event.target !== this.Element) return; //Clicked something inside of window
        this.ResizeDirection[0] = Event.offsetX < 8 ? -1 : Event.offsetX > this.Width + 8 ? 1 : 0;
        this.ResizeDirection[1] = Event.offsetY < 8 ? -1 : Event.offsetY > this.Height + 8 ? 1 : 0;
        if(this.ResizeDirection[0] === 0 && this.ResizeDirection[1] === 0) return void console.log("Clicked to resize but didn't detect resize direction. This is a bug.");
        this.Resizing = true;
        document.documentElement.style.cursor = `${this.ResizeDirection[1] === -1 ? "n" : this.ResizeDirection[1] === 1 ? "s" : ""}${this.ResizeDirection[0] === -1 ? "w" : this.ResizeDirection[0] === 1 ? "e" : ""}-resize`;
      }.bind(this)),
      AddEventListener(this.CloseElement, "click", function(Event){
        this.Destroy();
      }.bind(this))
    ];
  }
  Destroy(){
    this.IsDestroyed = true;
    FireEvent(this.Events, new CustomEvent("Close"));
    for(const EventID of this.EventIDs) RemoveEventListener(EventID);
    this.Element.remove();
  }
  SetDimensions(Width, Height){
    this.Width = Width;
    this.Height = Height;
    this.BodyElement.style.minWidth = this.BodyElement.style.maxWidth = this.BodyElement.style.width = Width + "px";
    this.BodyElement.style.minHeight = this.BodyElement.style.maxHeight = this.BodyElement.style.height = Height + "px";

    if(this.StrictDimensions){
      const Rect = this.Element.getBoundingClientRect();
      this.Width = Math.max(this.BodyElement.scrollWidth, Rect.width - 16);
      this.Height = this.BodyElement.scrollHeight;

      this.BodyElement.style.minWidth = this.Width;
      this.BodyElement.style.minHeight = this.Height;
    }
  }
  SetPosition(x, y){
    x = Math.max(48 - this.Width, Math.min(x, window.innerWidth - 48));
    y = Math.max(48 - this.Height, Math.min(y, window.innerHeight - 48));
    this.PositionX = x;
    this.PositionY = y;
    this.Element.style.left = x + "px";
    this.Element.style.top = y + "px";
  }
  ApplyMovement(dx, dy){
    this.SetPosition(this.PositionX + dx, this.PositionY + dy);
  }
  SetTitle(Title){
    this.TitleTextElement.textContent = Title;
  }
  ClearBody(){
    let Child;
    while((Child = this.BodyElement.firstChild) !== null){
      this.BodyElement.removeChild(Child);
    }
  }
  SetBody(Element){
    this.ClearBody();
    this.BodyElement.append(Element);
  }
};