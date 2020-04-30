import ZEditor from "./src/core/index";
import "./src/styles/zeditor.base.css";
let editor = new ZEditor(document.querySelector("#app"), { toolLayOut: "line" });