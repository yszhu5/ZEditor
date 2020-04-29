import { Tool, Config, defaults } from "./config";
import { ToolBar } from "./tool-bar";
import $Z from '../domUtil/index';
import { execCommand, queryCommand } from "./commands";

interface EventQueue {
  [index: string]: Set<Function>,
  contentChange: Set<Function>
}

export default class ZEditor { 
  el: HTMLElement  // 编辑器的容器Dom
  config: Config // 组件实例的配置项，优先级高于默认配置
  toolBar: ToolBar // 工具栏对象
  $body: HTMLElement // 编辑区dom对象
  count: number // 编辑区字数统计
  html: string // 编辑区html内容
  text: string // 编辑区文本内容
  private ranges: Array<Range> // 当前选取所对应的Range集合，用于恢复选区
  private events: EventQueue // 编辑器绑定的事件队列
  constructor(el: HTMLElement, config?: Config) {   
    this.el = el || document.body;
    this.toolBar = null;
    this.$body = null;
    this.ranges = [];
    this.events = {
      contentChange: new Set()
    };
    this.config = Object.assign(ZEditor.defaults, config); // 合并配置项
    this.init(); // 初始化
  }

  // 静态属性、方法
  static defaults: Config = defaults;

  private init() { // 编辑器初始化
    this.el.style.position = "relative";
    this.el.className += " zditor__wrap";
    this.el.innerHTML = `<header class="tool-bar__wrap" tabindex="0"></header><div class="editor-body__wrap" contenteditable="true"></div>`;
    let $tool: HTMLElement = this.el.querySelector(".tool-bar__wrap");
    let $body: HTMLElement = this.el.querySelector(".editor-body__wrap");
    this.initToolBar($tool, $body);
    this.initBody($body);
    this.eventBind();
  }

  private initToolBar(el: HTMLElement, body: HTMLElement) { // 工具栏初始化
    this.toolBar = new ToolBar(el, body, this.config, this.queryAllStates);
  }

  private initBody(body: HTMLElement) { // 编辑区初始化
    if(this.toolBar.el) {
      this.$body = body;
      this.setDeafultStyle();
      this.calcBodyHeight(); 
      this.focus();      
      this.queryAllStates();
    }
    else {
      console.error("init toolBar failed!");
    }
  }

  private eventBind() { // 编辑器事件绑定
    let vm = this;
    vm.storeRanges = vm.storeRanges.bind(vm);
    vm.setSelection = vm.setSelection.bind(vm);
    vm.queryAllStates = vm.queryAllStates.bind(vm);
    vm.calcBodyHeight = vm.calcBodyHeight.bind(vm);
    vm.insertSelection = vm.insertSelection.bind(vm);
    $Z(this.$body).on("blur", vm.storeRanges); // 监听编辑区失焦事件
    $Z(this.$body).on("mouseup", vm.queryAllStates); // 监听编辑区mouseup事件
    $Z(this.$body).on("keyup", (evt: UIEvent) => {
      this.callEvent("contentChange", evt);
    });
    $Z(this.toolBar.el).on("focus", vm.setSelection);
    $Z.onResize(vm.calcBodyHeight);
  }

  private callEvent(evtName: string, evt: UIEvent) {
    if(evtName === "contentChange") {
      this.countChars();
    }
    this.events[evtName].forEach((handler: Function) => {
      handler && handler();
    });
  }

  countChars() { // 统计字数
    this.html = this.$body.innerHTML;
    this.text = this.html.replace(/<.*?>/g, '');
    this.count = this.text.length;
    if(!this.html) {
      this.$body.innerHTML = "<p><br></p>";
    }
  }

  on(evtName: string, handler: Function): ZEditor { // 绑定编辑器事件
    if(!this.events[evtName]) {
      this.events[evtName] = new Set();
    }
    this.events[evtName].add(handler); 
    return this;
  }

  off(evtName: string, handler: Function): ZEditor { // 解除编辑器事件绑定
    this.events[evtName].delete(handler);
    return this;
  }

  setDeafultStyle() {  // 设置编辑区默认格式
    let defaultFontName = this.config.fontOptions.find(option => option.default);
    this.$body.style.fontFamily = defaultFontName.key;
    let defaultFontSize = this.config.fontSizeOptions.find(option => option.default);
    this.$body.style.fontSize = defaultFontSize.key;
  }

  focus() { // 编辑器聚焦
    this.countChars();
    this.$body.focus();
  }

  blur() { // 编辑器失焦
    this.$body.blur();
  }

  insertSelection() { // 插入空白段落
    this.execCommand("insertHTML", "<p><br></p>");
  }

  calcBodyHeight() { // 动态计算编辑区高度
    let top = this.toolBar.el.clientHeight;
    let height = this.el.clientHeight;
    this.$body.style.height = Math.floor(height - top - 8) + "px";
  }

  private queryAllStates() { // 计算所有工具栏状态值 
    let tools: Array<Tool>;
    if(this.config.toolLayOut === "tab") {
      let { base, insert, layout } = { ...this.config.toolTabs };
      tools = base.concat(insert, layout) as Array<Tool>;
    }
    else {
      tools = this.config.tools as Array<Tool>;
    } 
    tools.forEach((tool: Tool) => {
      tool.setState && tool.setState();
    }); 
  }

  storeRanges() { // 保存当前选取Range对象
    let selection = window.getSelection();
    this.ranges = [];
    for(let i=0; i<selection.rangeCount; i++) {
      this.ranges.push(selection.getRangeAt(i));
    }
  }

  setSelection() { // 恢复当前选区    
    let selection = window.getSelection();
    selection.removeAllRanges();
    this.ranges.forEach(range => {
      selection.addRange(range);
    });
  }

  execCommand(cmdName: string, cmdParam?: string, ranges?: Array<Range>) { // 执行工具栏对应的command命令
    ranges && (this.ranges = ranges);
    this.setSelection();
    execCommand(cmdName, cmdParam);
  }

  queryCommand(cmdName: string, ranges?: Array<Range>, ) { //查询工具栏对应的command状态&计算值
    ranges && (this.ranges = ranges);
    this.setSelection();
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