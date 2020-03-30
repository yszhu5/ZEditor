import { ToolItem, ToolBar } from "./tool-bar";
import $Z from '../domUtil/index';
import command from "./commands";

export default class ZEditor {
  toolBar: ToolBar
  el: HTMLElement 
  tools: Array<ToolItem>
  $toolBar: HTMLElement
  $body: HTMLElement
  ranges: Array<Range>
  constructor({ el, tools }: { el: any, tools: Array<ToolItem> }) {
    this.toolBar = null;
    this.el = el || document.body;
    this.tools = tools || [];
    this.$toolBar = null;
    this.$body = null;
    this.ranges = [];
    this.init();
  }

  initToolBar() {
    this.toolBar = new ToolBar({
      el: this.el,
      tools: this.tools,
      onCommand: this.toolCommand.bind(this)
    });
  }

  initBody() {
    this.$toolBar = this.el.querySelector(".tool-bar__wrap");
    if(this.$toolBar) {
      let top = this.$toolBar.clientHeight;
      let height = this.el.clientHeight;
      this.$body = document.createElement("div");
      this.$body.className = "editor-body__wrap";
      this.$body.contentEditable = "true";
      this.$body.style.height = Math.floor(height - top - 8) + "px";
      this.el.appendChild(this.$body);
    }
    else {
      console.error("init toolBar failed!");
    }
  }

  init() {
    this.el.style.position = "relative";
    this.el.className += " zditor__wrap";
    this.initToolBar();
    this.initBody();
    this.eventBind();
  }

  toolCommand(evt: UIEvent, tool: ToolItem) {
    if(tool.handler) {
      tool.handler(evt, this.ranges);
    }
    else {
      //this.selection
      let selection = window.getSelection();
      selection.removeAllRanges();
      this.ranges.forEach(range => {
        selection.addRange(range);
      });
      this.execCommand(tool.key);
    }
  }

  getSelection() {
    let selection = window.getSelection();
    this.ranges = [];
    for(let i=0; i<selection.rangeCount; i++) {
      this.ranges.push(selection.getRangeAt(i));
    }
  }

  execCommand(cmdName: string) {
    command(cmdName);
    this.getSelection();
  }

  domRended(task: Function, dom: HTMLElement) {
    if(window.MutationObserver) {
      let observer = new MutationObserver(() => {
        task();
        observer.disconnect();
      });
      observer.observe;
    }
    else {
      setTimeout(task, 0);
    }
  }

  eventBind() {
    let vm = this;
    vm.getSelection = vm.getSelection.bind(vm);
    $Z(this.$body).on("mouseup", vm.getSelection);
  }
}