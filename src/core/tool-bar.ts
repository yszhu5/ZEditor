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
  "foreColor": "字体颜色",
  "hiliteColor": "突出显示"
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

export const colorOptions: Array<OptionItem> = [
  { key: "255, 255, 255", value: ""},
  { key: "0, 0, 0", value: ""},
  { key: "231, 230, 230", value: ""},
  { key: "68, 84, 106", value: ""},
  { key: "91, 155, 213", value: ""},
  { key: "237, 125, 49", value: ""},
  { key: "165, 165, 165", value: ""},
  { key: "255, 192, 0", value: ""},
  { key: "68, 114, 196", value: ""},
  { key: "112, 173, 71", value: ""},

  { key: "242, 242, 242", value: ""},
  { key: "128, 128, 128", value: ""},
  { key: "208, 206, 206", value: ""},
  { key: "214, 220, 229", value: ""},
  { key: "222, 235, 247", value: ""},
  { key: "251, 229, 214", value: ""},
  { key: "237, 237, 237", value: ""},
  { key: "255, 242, 204", value: ""},
  { key: "218, 227, 243", value: ""},
  { key: "226, 240, 217", value: ""},


  { key: "217, 217, 217", value: ""},
  { key: "89, 89, 89", value: ""},
  { key: "175, 171, 171", value: ""},
  { key: "173, 185, 202", value: ""},
  { key: "189, 215, 238", value: ""},
  { key: "248, 203, 173", value: ""},
  { key: "219, 219, 219", value: ""},
  { key: "255, 230, 153", value: ""},
  { key: "180, 199, 231", value: ""},
  { key: "197, 224, 180", value: ""},

  { key: "191, 191, 191", value: ""},
  { key: "64, 64, 64", value: ""},
  { key: "118, 113, 113", value: ""},
  { key: "132, 151, 176", value: ""},
  { key: "157, 195, 230", value: ""},
  { key: "244, 177, 131", value: ""},
  { key: "201, 201, 201", value: ""},
  { key: "255, 217, 102", value: ""},
  { key: "143, 170, 220", value: ""},
  { key: "169, 209, 142", value: ""},

  { key: "166, 166, 166", value: ""},
  { key: "38, 38, 38", value: ""},
  { key: "59, 56, 56", value: ""},
  { key: "51, 63, 80", value: ""},
  { key: "46, 117, 182", value: ""},
  { key: "197, 90, 17", value: ""},
  { key: "124, 124, 124", value: ""},
  { key: "191, 144, 0", value: ""},
  { key: "47, 85, 151", value: ""},
  { key: "84, 130, 53", value: ""},

  { key: "127, 127, 127", value: ""},
  { key: "13, 13, 13", value: ""},
  { key: "24, 23, 23", value: ""},
  { key: "34, 42, 53", value: ""},
  { key: "31, 78, 121", value: ""},
  { key: "132, 60, 11", value: ""},
  { key: "83, 83, 83", value: ""},
  { key: "127, 96, 0", value: ""},
  { key: "32, 56, 100", value: ""},
  { key: "56, 87, 35", value: ""}

];

export const standerColors: Array<OptionItem> = [
  { key: "192, 0, 0", value: ""},
  { key: "255, 0, 0", value: ""},
  { key: "255, 192, 0", value: ""},
  { key: "255, 255, 0", value: ""},
  { key: "146, 208, 80", value: ""},
  { key: "0, 176, 80", value: ""},
  { key: "0, 176, 240", value: ""},
  { key: "0, 112, 192", value: ""},
  { key: "0, 32, 96", value: ""},
  { key: "112, 48, 160", value: ""}
]

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
      tool.queryState = (ranges?: Array<Range>): boolean | Array<string> => queryCommand(tool.key);
    }
    let $item: HTMLElement;
    switch(tool.key) {
      case "fontName": // 字体工具初始化
        tool.setState = selectFontName.bind(tool);
        $item = this.initFontSelect(tool, fontOptions, { width: 100 });
        break;      
      case "foreColor": // 字体颜色工具初始化
        $item = this.initColorPicker(tool);
        break;
      case "hiliteColor": // 背景色突出显示
        $item = this.initColorPicker(tool);
        break;
      case "fontSize": // 字号工具初始化
        tool.setState = selectFontSize.bind(tool);
        $item = this.initFontSelect(tool, fontSizeOptions, {});
        break;
      default: // bold, italic, underline, strikeThrough
        tool.setState = setButtonActive.bind(tool);  
        $item = this.initButton(tool);
        break;
    }
    tool.elm = $item;
    return $item;
  }

  // 初始化工具栏按钮 (bold italic underline strikeThrough)
  initButton(tool: ToolItem): HTMLElement {
    let $button: HTMLElement = document.createElement("div");
    $button.className = "zeditor-tool__item " + tool.key;
    $button.title = tool.name;
    $button.innerHTML = `<i class="ze-icon-${tool.key}"></i>`;
    $button.onclick = evt => this.onCommand(evt, tool);   
    return $button;
  }

  // 初始化字体下拉选择工具（fontName & fontSize）
  initFontSelect(
    tool: ToolItem,
    options: Array<OptionItem>,
    { top=28, height=300, width }: { top?: number, width?: number, height?: number}
  ): HTMLElement {
    let $select: HTMLElement = document.createElement("div");
    $select.className = `zeditor-tool__item ${tool.key} dropdown`;
    $select.innerHTML = `<input type="text" class="select-input" />`;
    setSelectValue($select, options);
    // 创建弹出层
    let $popper = this.createPopper(options, { top, height, width }, (evt?: UIEvent, option?: OptionItem) => {
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

  // 初始化颜色选择工具( forceColor & hiliteColor)
  initColorPicker(tool: ToolItem): HTMLElement {
    let $picker: HTMLElement = document.createElement("div");
    $picker.className = `zeditor-tool__item ${tool.key} dropdown`;
    $picker.innerHTML = `<i class="ze-icon-${tool.key}"></i><span class="color-block"></span></span>`;
    return $picker;
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

function setButtonActive(this: ToolItem) { // 设置按钮的激活状态
  if(this.queryState) {
    this.elm.className = `zeditor-tool__item ${this.key}${this.queryState() ? ' is-active' : ''}`;
  }  
}

function selectFontName(this: ToolItem) { // 设置字体下拉框value
  if(this.queryState) {
    let fontName: Array<string> = this.queryState();
    let temp = [...new Set(fontName)];
    setSelectValue(this.elm, fontOptions, temp[0]);
  }
}

function selectFontSize(this: ToolItem) { // 设置字号下拉框value
  if(this.queryState) {
    let fontSize: Array<string> = this.queryState();
    let temp = [...new Set(fontSize)]; // 去重
    // 计算系统dpi，进行pt与px的换算
    let tmpNode = document.createElement( "div" );
    let dpiY: number = 0;
    tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
    document.body.appendChild(tmpNode);
    dpiY = tmpNode.offsetHeight;
    document.body.removeChild(tmpNode);
    tmpNode = null;
    let $input: HTMLInputElement  = this.elm.querySelector("input.select-input");
    temp[0] && fontSizeOptions.forEach(option => {
      if(option.key.indexOf("pt") >= 0) { // 只支持pt和px俩种单位的字号选项
        if(parseFloat(option.key).toFixed(1) === (parseFloat(temp[0]) * 72 / dpiY).toFixed(1)) {
          this.elm.title = option.value;
          $input.value = option.value;
        }
      }
      else if(option.key.indexOf("px") >= 0) {
        if(parseFloat(option.key).toFixed(1) === parseFloat(temp[0]).toFixed(1)) {
          this.elm.title = option.value;
          $input.value = option.value;
        }
      }
    });
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