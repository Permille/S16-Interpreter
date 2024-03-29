export default class MemoryViewer{
  constructor(RootElement){
    this.RootElement = RootElement;
    this.IsIn32BitMode = false;

    this.OffsetWrapperElement = document.createElement("div");
    this.OffsetWrapperElement.className = "OffsetWrapper";
    this.OffsetWrapperElement.append(
      this.MMElement = document.createElement("span"),
      this.MElement = document.createElement("span"),
      this.OffsetInputElement = document.createElement("input"),
      this.PElement = document.createElement("span"),
      this.PPElement = document.createElement("span")
    );
    this.MMElement.innerText = "<<";
    this.MElement.innerText = "<";
    this.PElement.innerText = ">";
    this.PPElement.innerText = ">>";
    this.OffsetInputElement.type = "text";
    this.OffsetInputElement.pattern = "([0-9]+|(0x[0-9a-fA-F]+))";
    this.OffsetInputElement.defaultValue = "0x0000";
    this.OffsetInputElement.required = "true";

    this.MMElement.addEventListener("click", () => void (this.SetMemoryOffset(Math.max(this.MemoryMin - 64, 0)), this.UpdateOffsetInputElementValue()));
    this.MElement.addEventListener("click", () => void (this.SetMemoryOffset(Math.max(this.MemoryMin - 1, 0)), this.UpdateOffsetInputElementValue()));
    this.PElement.addEventListener("click", () => void (this.SetMemoryOffset(Math.min(this.MemoryMin + 1, !this.IsIn32BitMode ? 65535 : 4294967295)), this.UpdateOffsetInputElementValue()));
    this.PPElement.addEventListener("click", () => void (this.SetMemoryOffset(Math.min(this.MemoryMin + 64, !this.IsIn32BitMode ? 65535 : 4294967295)), this.UpdateOffsetInputElementValue()));
    this.OffsetInputElement.addEventListener("input", function(){
      if(!this.OffsetInputElement.checkValidity()) return;
      const TextValue = this.OffsetInputElement.value;
      const Value = Number.parseInt(TextValue, /^0x/.test(TextValue) ? 16 : 10);
      this.SetMemoryOffset(Value);
    }.bind(this));
    this.OffsetInputElement.addEventListener("blur", this.UpdateOffsetInputElementValue.bind(this));

    RootElement.append(this.OffsetWrapperElement);
    

    this.ContentElement = document.createElement("div");
    this.ContentElement.classList.add("Content");
    RootElement.append(this.ContentElement);
    this.Columns = -1;
    this.Rows = 10;
    this.Descriptors = [];
    this.Cells = [];
    this.RowElements = [];
    this.SelectedElement = null;
    this.MemoryMin = 0;
    this.MemoryMax = this.Rows * this.Columns;
    this.MemorySegmentView = new Uint16Array(0);


    document.addEventListener("keydown", function(Event){
      if(Event.key !== "Escape") return;
      if(this.SelectedElement !== null){
        this.SelectedElement.classList.remove("Selected");
        this.SelectedElement = null;
      }
    }.bind(this));
    this.ContentElement.addEventListener("wheel", function(Event){
      Event.preventDefault();
      this.SetMemoryOffset(Math.max(0, this.MemoryMin + this.Columns * 4 * -Math.sign(Event.wheelDeltaY)));      
      this.UpdateOffsetInputElementValue();
    }.bind(this));

    this.Resize();
    new ResizeObserver(this.Resize.bind(this)).observe(this.RootElement.parentElement);
  }
  Set32BitMode(IsIn32BitMode){
    this.IsIn32BitMode = IsIn32BitMode;
    this.SetMemoryOffset(this.MemoryMin);
    this.UpdateOffsetInputElementValue();
  }
  UpdateOffsetInputElementValue(){
    this.OffsetInputElement.value = `0x${this.MemoryMin.toString(16).padStart(this.IsIn32BitMode ? 8 : 4, "0")}`;
  }
  SetMemoryOffset(NewOffset){
    NewOffset = Math.min(Math.max(NewOffset, 0), (this.IsIn32BitMode ? 4294967296 : 65536) - this.MemoryMax);
    this.MemoryMin = NewOffset;
    for(let i = 0; i < this.Descriptors.length; ++i){
      this.Descriptors[i].innerText = "0x" + (this.MemoryMin + i * this.Columns * 4).toString(16).padStart(this.IsIn32BitMode ? 8 : 4, 0);
    }
    this.UpdateMemory(this.MemorySegmentView);
  }
  SetRows(Rows){
    if(this.Rows === Rows) return;
    this.Rows = Rows;
    this.Resize();
  }
  Resize(){
    this.MemoryMax = this.Rows * this.Columns * 4;
    this.SetMemoryOffset(this.MemoryMin);
    const Width = this.RootElement.parentElement.offsetWidth;
    const Columns = Math.min(4, Math.floor((Width - 100) / (41.25 * 4 + 10)));
    if(Columns === this.Columns) return;
    this.Columns = Columns;

    this.RootElement.style.width = `${Columns * (41.25 * 4 + 10) + 100}px`;
    while(this.Descriptors.length > 0) this.Descriptors.pop().remove();
    while(this.Cells.length > 0) this.Cells.pop().remove();
    while(this.RowElements.length > 0) this.RowElements.pop().remove();
    this.SelectedElement = null;
    for(let i = 0; i < this.Rows; ++i){
      const RowElement = document.createElement("div");
      this.RowElements.push(RowElement);
      this.ContentElement.append(RowElement);
      const Descriptor = document.createElement("p");
      this.Descriptors.push(Descriptor);
      RowElement.append(Descriptor);
      for(let i = 0; i < Columns * 4; ++i){
        const Cell = document.createElement("p");
        Cell.addEventListener("click", this.ClickedCell.bind(this, this.Cells.length));
        this.Cells.push(Cell);
        RowElement.append(Cell);
      }
    }

    for(let i = 0; i < this.Descriptors.length; ++i){
      this.Descriptors[i].innerText = "0x" + (this.MemoryMin + i * this.Columns * 4).toString(16).padStart(4, 0);
    }
    
    for(let i = 0; i < this.Cells.length; ++i){
      let Text;
      if(i >= this.MemorySegmentView.length) Text = "????";
      else Text = this.MemorySegmentView[i].toString(16).padStart(4, 0);
      this.Cells[i].innerText = Text;
    }

  }
  ClickedCell(CellID){
    if(this.SelectedElement !== null){
      this.SelectedElement.classList.remove("Selected");
    }
    this.Cells[CellID].classList.add("Selected");
    this.SelectedElement = this.Cells[CellID];
  }
  UpdateMemory(NewMemorySegment){
    this.MemorySegmentView = NewMemorySegment;
    for(let i = 0; i < this.Cells.length; ++i){
      let Text;
      if(i >= this.MemorySegmentView.length) Text = "????";
      else Text = this.MemorySegmentView[i].toString(16).padStart(4, 0);
      this.Cells[i].innerText = Text;
    }
  }
};