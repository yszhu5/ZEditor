import { ToolItem, ToolBar, fontOptions, fontSizeOptions } from "./tool-bar";
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

  private initToolBar() {
    this.toolBar = new ToolBar({
      el: this.el,
      tools: this.tools,
      onCommand: this.toolCommand.bind(this)
    });
  }

  private initBody() {
    this.$toolBar = this.el.querySelector(".tool-bar__wrap");
    if(this.$toolBar) {
      this.$body = document.createElement("div");
      this.$body.className = "editor-body__wrap";
      this.$body.contentEditable = "true";      
      this.setDeafultStyle();
      this.calcBodyHeight(); 
      this.el.appendChild(this.$body);
      this.focus();
      this.queryAllStates();
    }
    else {
      console.error("init toolBar failed!");
    }
  }

  setDeafultStyle() {  // 设置编辑区默认格式
    let defaultFontName = fontOptions.find(option => option.default);
    this.$body.style.fontFamily = defaultFontName.key;
    let defaultFontSize = fontSizeOptions.find(option => option.default);
    this.$body.style.fontSize = defaultFontSize.key;
  }

  focus() { // 编辑器聚焦
    this.$body.focus();
  }

  calcBodyHeight() { // 动态计算编辑区高度
    let top = this.$toolBar.clientHeight;
    let height = this.el.clientHeight;
    this.$body.style.height = Math.floor(height - top - 8) + "px";
  }

  private init() { // 编辑器初始化
    this.el.style.position = "relative";
    this.el.className += " zditor__wrap";
    this.initToolBar();
    this.initBody();
    this.eventBind();
  }

  private toolCommand(evt: UIEvent, tool: ToolItem, cmdName?: string) { // 工具栏点击事件回调
    let selection = window.getSelection();
    selection.removeAllRanges();
    this.ranges.forEach(range => {
      selection.addRange(range);
    });
    tool.handler(evt, this.ranges, cmdName);
    this.getSelection();
  }

  private queryAllStates() { // 计算所有工具栏状态值 
    let baseTool: Array<ToolItem> = this.toolBar.tool.base as Array<ToolItem>; // 每次保存选区时检测工具栏状态
    for(let j=0,len=baseTool.length; j<len; j++) {
      baseTool[j].setState && baseTool[j].setState();
    }      
  }

  getSelection() { // 保存当前选区，保存为range
    let selection = window.getSelection();
    this.ranges = [];
    for(let i=0; i<selection.rangeCount; i++) {
      this.ranges.push(selection.getRangeAt(i));
    }
  }

  execCommand(cmdName: string, cmdParam?: string, ranges?: Array<Range>) { // 对外接口，执行command命令
    ranges && (this.ranges = ranges);
    this.getSelection();
    execCommand(cmdName, cmdParam);
  }

  queryCommand(cmdName: string, ranges?: Array<Range>, ) { // 对外接口，查询command状态
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

  private eventBind() { // 编辑器初始化事件绑定
    let vm = this;
    vm.getSelection = vm.getSelection.bind(vm);
    vm.queryAllStates = vm.queryAllStates.bind(vm);
    vm.calcBodyHeight = vm.calcBodyHeight.bind(vm);
    $Z(this.$body).on("blur", vm.getSelection);
    $Z(this.$body).on("mouseup", vm.queryAllStates);
    $Z.onResize(vm.calcBodyHeight);
  }
}