import WindowFrame from "../WindowFrame/WindowFrame.mjs";
export default class AdvancedSettingsWindow{
  constructor(){
    this.Window = new WindowFrame(900, 400);
    this.Window.SetTitle("Advanced settings");
    this.Window.SetPosition(100, 100);

    this.Wrapper = document.createElement("div");
    this.Window.BodyElement.append(this.Wrapper);
    this.Wrapper.style.paddingInline = "50px";
    this.Wrapper.style.paddingBlock = "15px";
    this.Wrapper.style.fontSize = "16px";
    this.Wrapper.append(document.createTextNode("Here you can enable and tweak advanced features such as the yielding interval or 32-bit mode."));
    this.Wrapper.append(document.createElement("br"));
    this.Wrapper.append(document.createElement("br"));
    this.Wrapper.append(document.createElement("br"));

    this.AddButton(
      "Enables 32-bit developer tools. This changes the register and memory viewers.",
      function(){
        window.Main.Interface.Tabs.get("State").Toggle32BitMode();
      },
      "Toggle"
    );
    this.AddInput(
      "Set the memory size. Rounded up to next 32768 words. This resets the interpreter. The interpreter must not be running.",
      function(MemorySize){
        window.Main.Interpreter.InitialiseWorker((MemorySize + 32767) >> 15);
      },
      "Set",
      65536,
      [65536, 2147450880]
    );
    this.AddInput(
      "Set the yield interval. Higher values are faster but the interpreter may become less responsive.",
      function(YieldInterval){
        window.Main.Interface.Tabs.get("Interpreter").YieldInterval = YieldInterval;
      },
      "Set",
      1000000,
      [1, 4294967295]
    );
    
  }
  AddButton(Text, Enabler, ButtonText){
    this.Wrapper.append(document.createTextNode(Text));
    this.Wrapper.append(document.createElement("br"));


    const ButtonsWrapper = document.createElement("div");
    ButtonsWrapper.style.fontSize = "16px";
    ButtonsWrapper.classList.add("ButtonsWrapper");
    ButtonsWrapper.style.justifyContent = "left";
    const Button = document.createElement("div");
    Button.style.width = "200px";
    Button.innerText = ButtonText;
    ButtonsWrapper.append(Button);

    Button.addEventListener("click", Enabler);
    
    this.Wrapper.append(ButtonsWrapper);
    this.Wrapper.append(document.createElement("br"));
  }
  AddInput(Text, Enabler, ButtonText, Default = 0, Range = [-Infinity, Infinity]){
    this.Wrapper.append(document.createTextNode(Text));
    this.Wrapper.append(document.createElement("br"));


    const ButtonsWrapper = document.createElement("div");
    ButtonsWrapper.style.fontSize = "16px";
    ButtonsWrapper.classList.add("ButtonsWrapper");
    ButtonsWrapper.style.justifyContent = "left";
    const Input = document.createElement("input");
    Input.type = "number";
    Input.value = Default;
    Input.style.width = "150px";

    Input.addEventListener("focusout", function(){
      Input.value = Math.min(Math.max(Number.parseInt(Input.value), Range[0]), Range[1]);
    });
    
    ButtonsWrapper.append(Input);
    const Button = document.createElement("div");
    Button.style.width = "45px";
    Button.innerText = ButtonText;
    ButtonsWrapper.append(Button);

    Button.addEventListener("click", function(){
      Enabler(Number.parseInt(Input.value));
    });
    
    this.Wrapper.append(ButtonsWrapper);
    this.Wrapper.append(document.createElement("br"));
  }
};