import { ToolItem, ToolBar, fontOptions } from "./tool-bar";
import $Z from '../domUtil/index';
import { execCommand, queryCommand } from "./commands";

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
      this.$body = document.createElement("div");
      this.$body.className = "editor-body__wrap";
      this.$body.contentEditable = "true";
      fontOptions[0] && (this.$body.style.fontFamily = fontOptions[0].key);
      this.calcBodyHeight();
      this.el.appendChild(this.$body);
      this.focus();
    }
    else {
      console.error("init toolBar failed!");
    }
  }

  focus() { // 编辑器聚焦
    this.$body.focus();
    this.getSelection();
  }

  calcBodyHeight() {
    let top = this.$toolBar.clientHeight;
    let height = this.el.clientHeight;
    this.$body.style.height = Math.floor(height - top - 8) + "px";
  }

  init() {
    this.el.style.position = "relative";
    this.el.className += " zditor__wrap";
    this.initToolBar();
    this.initBody();
    this.eventBind();
  }

  toolCommand(evt: UIEvent, tool: ToolItem, cmdName?: string) { // 工具栏点击事件回调
    let selection = window.getSelection();
    selection.removeAllRanges();
    this.ranges.forEach(range => {
      selection.addRange(range);
    });
    tool.handler(evt, this.ranges, cmdName);
    this.getSelection();
  }

  getSelection() { // 保存当前选区，保存为range
    let selection = window.getSelection();
    this.ranges = [];
    for(let i=0; i<selection.rangeCount; i++) {
      this.ranges.push(selection.getRangeAt(i));
    }   
    let baseTool: Array<ToolItem> = this.toolBar.tool.base as Array<ToolItem>; // 每次保存选区时检测工具栏状态
    for(let j=0,len=baseTool.length; j<len; j++) {
      baseTool[j].setState && baseTool[j].setState();
    }      
  }

  execCommand(cmdName: string, cmdParam?: string, ranges?: Array<Range>) { // 执行command命令
    ranges && (this.ranges = ranges);
    this.getSelection();
    execCommand(cmdName, cmdParam);
  }

  queryCommand(cmdName: string, ranges?: Array<Range>, ) { // 查询command状态
    ranges && (this.ranges = ranges);
    this.getSelection();
    return queryCommand(cmdName);
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
    vm.calcBodyHeight = vm.calcBodyHeight.bind(vm);
    $Z(this.$body).on("mouseup", vm.getSelection);
    $Z.onResize(vm.calcBodyHeight);
  }
}