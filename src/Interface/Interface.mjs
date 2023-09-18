import "./index.html?copy";
import "./Main.css";
import "./Header.css";
import "./Scrollbars.css";
import "./General.css";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import Split from "split-grid";

window.onload = function(){
  return;
  Split({
    "snapOffset": 100,
    "columnGutters": [
      {
        "track": 1,
        "element": document.getElementById("GutterColumn1")
      }
    ],
    "rowGutters": [
      {
        "track": 1,
        "element": document.getElementById("GutterRow1")
      }
    ]
  });
  return;
  const MonacoContainer = document.createElement("div");
  MonacoContainer.style.height = "300px";
  document.body.append(MonacoContainer);
  Monaco.editor.create(MonacoContainer, {
    "value": "console.log(\"hi\");",
    "theme": "vs-dark",
    "language": "javascript",
    "automaticLayout": true,
    "fontSize": 18
  });
  
};