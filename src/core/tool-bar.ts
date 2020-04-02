import $Z from '../domUtil/index';
import { execCommand, queryCommand } from "./commands";

interface TabItem { name: string, key: string };
export interface ToolItem { name: string, key: string, handler: Function, queryState: Function, setState: Function, elm: HTMLElement };
interface Tab { tabList: Array<TabItem>, activeTab: TabItem, node?: any };
interface Tool { base: Array<ToolItem | string>, insert: Array<ToolItem>, layout: Array<ToolItem> };
interface ToolMap {
  [index: string]: string
};
interface OptionItem { key: string, value: string };

const baseTools: ToolMap = {
  "fontName": "字体",
  "bold": "加粗",
  "italic": "斜体",
  "underline": "下划线",
  "strikeThrough": "删除线",
  "color": "字体颜色"
};

export const fontOptions: Array<OptionItem> = [
  { key: `微软雅黑, "Microsoft YaHei"`, value: "微软雅黑" },
  { key: `宋体, SimSun`, value: "宋体" },  
  { key: "KaiTi", value: "楷体" }
];

export class ToolBar {
  el: any
  title: string
  tab: Tab
  tool: Tool
  onCommand: Function
  constructor({ el, tools, onCommand, title }: {
    el: any,
    tools: Array<ToolItem | string>,
    onCommand: Function,
    title?: string
  }) {
    this.el = el;
    this.title = title || "新建文档";
    this.tab = {
      tabList: [
        { name: "开始", key: "base" },
        { name: "插入", key: "insert" },
        { name: "布局", key: "layout" }
      ],
      activeTab: null,
      node: null
    };
    this.tool = {
      base: tools || [],
      insert: [],
      layout: [],
    };
    this.onCommand = onCommand;
    this.init();
  }

  init(): void {
    let bar = document.createElement("header");
    bar.className = "tool-bar__wrap";
    bar.innerHTML = this.initTab() + this.initTool();
    this.el.appendChild(bar);
    this.initBaseTool();
    this.eventBind(); 
  }

  initTab() {
    let tmpl: string = `<div class="tool-bar__tab-list">`;
    for(let i:number=0; i<this.tab.tabList.length; i++) {
      let tab = this.tab.tabList[i];
      i === 0 && !this.tab.activeTab && (this.tab.activeTab = tab);
      tmpl += `<span class="tool-bar__tab-item${this.tab.activeTab.key === tab.key ? ' is-active' : ''}" key="${tab.key}" title="${tab.name}">${tab.name}</span>`;
    }
    return tmpl + "</div>";
  }

  initTool(): string {
    let template: string = "";
    let key: string;
    for(key in this.tool) {
      let tmpl: string = `<div class="tool-bar__tool--${key}" style="${key !== this.tab.activeTab.key ? 'display: none;' : ''}"></div>`;
      template += tmpl;
    }
    return template;
  }

  initBaseTool(): void {
    !this.tool.base.length && (this.tool.base = Object.keys(baseTools));
    const fragment = document.createDocumentFragment();
    this.tool.base = this.tool.base.map((tool: ToolItem | string): ToolItem => {
      let tempTool: ToolItem;
      if(typeof tool === "string") {
        tempTool =  { name: baseTools[tool], key: tool, handler: null, queryState: null, setState: null, elm: null };
      }
      else {
        tempTool =  tool;
      }
      fragment.appendChild(this.initToolItem(tempTool));
      return tempTool;
    });    
    let $baseTool = this.el.querySelector(".tool-bar__tool--base");
    $baseTool.appendChild(fragment);
  }

  destoryTool(): void {

  }

  setActiveTab(evt: UIEvent, target: HTMLElement ) {
    let key: string =  target.getAttribute("key");
    if(this.tab.activeTab.key !== key) {
      this.tab.activeTab = this.tab.tabList.find(tab => tab.key === key);
      let activeTab = this.el.querySelector(".tool-bar__tab-item.is-active");
      activeTab.className = activeTab.className.replace(/ is-active/g, "");
      target.className += " is-active";     
    }  
  }

  initToolItem(tool: ToolItem): HTMLElement {
    if(!tool.handler) { // 指定默认的handler方法
      tool.handler = (evt?: UIEvent, ranges?: Array<Range>, cmdParam?: string): boolean => execCommand(tool.key, cmdParam);
    }
    if(!tool.queryState) { // 指定默认的queryState方法
      tool.queryState = (ranges?: Array<Range>): boolean | string => queryCommand(tool.key);
    }
    let $item: HTMLElement;
    switch(tool.key) {
      case "fontName": // 字体工具初始化
        tool.setState = setFontName.bind(tool);
        $item = this.initFontFamily(tool);
        break;      
      case "foreColor": // 字体颜色工具初始化
        break;
      case "fontSize": // 字号工具初始化
      default: // bold, italic, underline, strikeThrough
        tool.setState = setButtonActive.bind(tool);
        $item = this.initButton(tool);
        break;
    }
    tool.elm = $item;
    return $item;
  }

  initButton(tool: ToolItem) {
    let $button: HTMLElement = document.createElement("div");
    $button.className = "zeditor-tool__item " + tool.key;
    $button.title = tool.name;
    $button.innerHTML = `<i class="ze-icon-${tool.key}"></i>`;
    $button.onclick = evt => this.onCommand(evt, tool);   
    return $button;
  }

  initFontFamily(tool: ToolItem): HTMLElement {
    let $select: HTMLElement = document.createElement("div");
    $select.className = "zeditor-tool__item " + tool.key;
    $select.innerHTML = `<input type="text" class="select-input" /><span class="icon"><i class="ze-icon-arrow--down"></i></span>`;
    setSelectValue($select, fontOptions);
    // 创建弹出层
    let $popper = this.createPopper(fontOptions, { top: 28, height: 300 }, (evt?: UIEvent, option?: OptionItem) => {
      setSelectValue($select, fontOptions, option);
      this.onCommand(evt, tool, option.key); 
    });
    $select.appendChild($popper);
    let vm = $Z($select); // 下拉框事件绑定
    vm.on("click", (evt: UIEvent, target: HTMLElement) => {
      evt.stopPropagation();
      vm.toggleClass("show");
    });
    $Z(document.body).on("click", (evt: UIEvent, target: HTMLElement) => { // 点击空白处关闭下拉框
      vm.toggleClass("show", false);
    });
    return $select;
  }

  createPopper(options: Array<OptionItem>, { top, width, height }: { top?: number, width?: number, height?: number}, change: Function): HTMLElement {
    let $ul = document.createElement("ul");
    $ul.className = "ze-popper__wrap";
    top && ($ul.style.top = top + "px");
    width && ($ul.style.width = width + "px");
    height && ($ul.style.maxHeight = height + "px");
    options.forEach(option => {
      let $li = document.createElement("li");
      $li.className = "ze-popper__item";
      $li.innerText = option.value;
      $li.onclick = evt => {
        change && change(evt, option);
      };
      $ul.appendChild($li);
    });
    return $ul;
  }

  eventBind(): void {
    let vm = this;
    vm.setActiveTab = this.setActiveTab.bind(vm);
    $Z(this.el).on("click", ".tool-bar__tab-item", vm.setActiveTab);
  }
}

function setButtonActive(this: ToolItem) {
  if(this.queryState) {
    this.elm.className = `zeditor-tool__item ${this.key}${this.queryState() ? ' is-active' : ''}`;
  }  
}

function setFontName(this: ToolItem) {
  if(this.queryState) {
    let fontName: string = this.queryState();
    setSelectValue(this.elm, fontOptions, fontName);
  }
}

function setSelectValue(select: HTMLElement, options: Array<OptionItem>, option?: OptionItem | string) {
  let value: string = "";
  let $input: HTMLInputElement  = select.querySelector("input.select-input");
  if(typeof option === "string") {
    option = options.find(item => item.key === option);
  }
  option && (value = option.value); 
  $input && ($input.value = value);
  select.title = value;
}

export default ToolBar;