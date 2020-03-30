import $Z from '../domUtil/index';

interface TabItem { name: string, key: string };
export interface ToolItem { name: string, key: string, handler: Function, active: boolean };
interface Tab { tabList: Array<TabItem>, activeTab: TabItem, node?: any };
interface Tool { base: Array<ToolItem | string>, insert: Array<ToolItem>, layout: Array<ToolItem> };
interface ToolMap {
  [index: string]: string
};

const baseTools: ToolMap = {
  "font-family": "字体",
  "bold": "加粗",
  "italic": "斜体",
  "underline": "下划线",
  "deleteline": "删除线",
  "color": "字体颜色"
};

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
        tempTool =  {
          name: baseTools[tool],
          key: tool,
          handler: null,
          active: false
        };
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
    if(tool.key === "font-family") { // 字体工具
      return this.initFontFamily(tool);
    }
    else {
      return this.initButton(tool);
    }    
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
    $select.title = tool.name;
    return $select;
  }








  eventBind(): void {
    let vm = this;
    vm.setActiveTab = this.setActiveTab.bind(vm);
    $Z(this.el).on("click", ".tool-bar__tab-item", vm.setActiveTab);
  }
}

export default ToolBar;