import { ToolItem, Config, defaults } from "config";
import { ToolBar } from "./tool-bar";
import $Z from '../domUtil/index';
import { execCommand, queryCommand } from "./commands";

interface ZE {
  defaults: Config
}

export default class ZEditor implements ZE { 
  el: HTMLElement  // 编辑器的容器Dom
  config: Config // 组件实例的配置项，优先级高于默认配置
  toolBar: ToolBar // 工具栏对象
  $body: HTMLElement // 编辑区dom对象
  private ranges: Array<Range> // 当前选取所对应的Range集合，用于恢复选区
  defaults: Config
  constructor(el: HTMLElement, config?: Config) {    
    this.el = el || document.body;
    this.toolBar = null;
    this.$body = null;
    this.ranges = [];
    this.config = Object.assign(ZEditor.defaults, config); // 合并配置项
    this.init(); // 初始化
  }

  // 静态属性、方法
  static defaults: Config = defaults;

  private init() { // 编辑器初始化
    this.el.style.position = "relative";
    this.el.className += " zditor__wrap";
    this.initToolBar();
    this.initBody();
    this.eventBind();
  }

  private initToolBar() { // 工具栏初始化
    let $el = document.createElement("header");  
    this.toolBar = new ToolBar($el, this.config, this.toolCommand.bind(this));
    this.el.appendChild($el);
    $el = null;
  }

  private initBody() { // 编辑区初始化
    if(this.toolBar.el) {
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

  private eventBind() { // 编辑器事件绑定
    let vm = this;
    vm.getSelection = vm.getSelection.bind(vm);
    vm.queryAllStates = vm.queryAllStates.bind(vm);
    vm.calcBodyHeight = vm.calcBodyHeight.bind(vm);
    $Z(this.$body).on("blur", vm.getSelection);
    $Z(this.$body).on("mouseup", vm.queryAllStates);
    $Z.onResize(vm.calcBodyHeight);
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

  setDeafultStyle() {  // 设置编辑区默认格式
    let defaultFontName = this.config.fontOptions.find(option => option.default);
    this.$body.style.fontFamily = defaultFontName.key;
    let defaultFontSize = this.config.fontSizeOptions.find(option => option.default);
    this.$body.style.fontSize = defaultFontSize.key;
  }

  focus() { // 编辑器聚焦
    this.$body.focus();
  }

  blur() { // 编辑器失焦
    this.$body.focus();
  }

  calcBodyHeight() { // 动态计算编辑区高度
    let top = this.toolBar.el.clientHeight;
    let height = this.el.clientHeight;
    this.$body.style.height = Math.floor(height - top - 8) + "px";
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

  execCommand(cmdName: string, cmdParam?: string, ranges?: Array<Range>) { // 执行工具栏对应的command命令
    ranges && (this.ranges = ranges);
    this.getSelection();
    execCommand(cmdName, cmdParam);
  }

  queryCommand(cmdName: string, ranges?: Array<Range>, ) { //查询工具栏对应的command状态&计算值
    ranges && (this.ranges = ranges);
    this.getSelection();
    return queryCommand(cmdName);
  }

  /*domRended(task: Function, dom: HTMLElement) {
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
  }*/
}