export default class MemoryViewer{
  constructor(RootElement){
    this.RootElement = RootElement;
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
    document.addEventListener("wheel", function(Event){
      this.MemoryMin = Math.max(0, this.MemoryMin + this.Columns * 4 * -Math.sign(Event.wheelDeltaY));
      for(let i = 0; i < this.Descriptors.length; ++i){
        this.Descriptors[i].innerText = "0x" + (this.MemoryMin + i * this.Columns * 4).toString(16).padStart(4, 0);
      }
      this.UpdateMemory(this.MemorySegmentView);
      
    }.bind(this));

    this.Resize();
    window.addEventListener("resize", this.Resize.bind(this));
  }
  SetRows(Rows){
    if(this.Rows === Rows) return;
    this.Rows = Rows;
    this.Resize();
  }
  Resize(){
    this.MemoryMin = 0;
    this.MemoryMax = this.Rows * this.Columns;
    const Width = window.innerWidth;
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