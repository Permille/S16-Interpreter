export default class Tab{
  constructor(Button, Body){
    this.Button = Button;
    this.Body = Body;
    this.Events = new EventTarget;

    this.Button.addEventListener("click", this.Show.bind(this));
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