import $Z from '../domUtil/index';
import { execCommand, queryCommand } from "./commands";

interface TabItem { name: string, key: string };
export interface ToolItem { name: string, key: string, handler: Function, queryState: Function, setState: Function, elm: HTMLElement };
interface Tab { tabList: Array<TabItem>, activeTab: TabItem, node?: any };
interface Tool { base: Array<ToolItem | string>, insert: Array<ToolItem>, layout: Array<ToolItem> };
interface ToolMap {
  [index: string]: string
};
interface OptionItem { key: string, value: string, default?: boolean };

const baseTools: ToolMap = {
  "fontName": "字体",
  "fontSize": "字号",
  "bold": "加粗",
  "italic": "斜体",
  "underline": "下划线",
  "strikeThrough": "删除线",
  "color": "字体颜色"
};

export const fontOptions: Array<OptionItem> = [
  { key: `微软雅黑, "Microsoft YaHei"`, value: "微软雅黑", default: true },
  { key: `宋体, SimSun`, value: "宋体" },
  { key: "FangSong", value: "仿宋" },
  { key: "FangSong_GB2312", value: "仿宋GB_2312" },
  { key: "YouYuan", value: "幼圆" },
  { key: "KaiTi", value: "楷体" },
  { key: "黑体, SimHei", value: "黑体" },
  { key: "隶书, SimLi", value: "隶书" },
  { key: "arial", value: "arial" } 
   
];

export const fontSizeOptions: Array<OptionItem> = [
  { key: "42pt", value: "初号" },
  { key: "36pt", value: "小初" },
  { key: "28pt", value: "一号" },
  { key: "24pt", value: "小一" },
  { key: "22pt", value: "二号" },
  { key: "18pt", value: "小二" },
  { key: "16pt", value: "三号" },
  { key: "15pt", value: "小三" },
  { key: "14pt", value: "四号" },
  { key: "12pt", value: "小四"},
  { key: "11pt", value: "五号", default: true },
  { key: "9pt", value: "小五" },
  { key: "8pt", value: "六号" },
  { key: "7pt", value: "小六" },
  { key: "6pt", value: "七号" },
  { key: "7pt", value: "小六" },
  { key: "5pt", value: "八号" }
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

  setActiveTab(evt: UIEvent, target: HTMLElement ) {
    let key: string =  target.getAttribute("key");
    if(this.tab.activeTab.key !== key) {
      this.tab.activeTab = this.tab.tabList.find(tab => tab.key === key);
      $Z(".zditor__wrap .tool-bar__tab-item").toggleClass("is-active", false);
      $Z(target).toggleClass("is-active", true);
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
        $item = this.initFontSelect(tool, fontOptions);
        break;      
      case "foreColor": // 字体颜色工具初始化
        break;
      case "fontSize": // 字号工具初始化
        tool.setState = setFontSize.bind(tool);
        $item = this.initFontSelect(tool, fontSizeOptions);
        break;
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

  initFontSelect(tool: ToolItem, options: Array<OptionItem>): HTMLElement { // 初始化字体下拉选择工具（fontName & fontSize）
    let $select: HTMLElement = document.createElement("div");
    $select.className = "zeditor-tool__item " + tool.key;
    $select.innerHTML = `<input type="text" class="select-input" /><span class="icon"><i class="ze-icon-arrow--down"></i></span>`;
    setSelectValue($select, options);
    // 创建弹出层
    let $popper = this.createPopper(options, { top: 28, height: 300 }, (evt?: UIEvent, option?: OptionItem) => {
      setSelectValue($select, options, option);
      this.onCommand(evt, tool, option.key); 
    });
    $select.appendChild($popper);
    // 下拉框事件绑定
    let vm = $Z($select);
    vm.on("click", (evt: UIEvent, target: HTMLElement) => {
      evt.stopPropagation();
      vm.toggleClass("show");
    });
    $Z(document.body).on("click", (evt: UIEvent, target: HTMLElement) => { // 点击空白处关闭下拉框
      vm.toggleClass("show", false);
    });
    return $select;
  }

  initFontSize(tool: ToolItem): HTMLElement { // 初始化字号选择工具
    let $select: HTMLElement = document.createElement("div");
    $select.className = "zeditor-tool__item " + tool.key;
    $select.innerHTML = `<input type="text" class="select-input" /><span class="icon"><i class="ze-icon-arrow--down"></i></span>`;
    this.createPopper(fontSizeOptions, { top: 28, height: 300 }, (evt?: UIEvent, option?: OptionItem) => {
      setSelectValue($select, fontOptions, option);
      this.onCommand(evt, tool, option.key); 
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

function setFontSize(this: ToolItem) {

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