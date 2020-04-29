import { Tool, Option, Config } from "./config";
import $Z from '../domUtil/index';
import { execCommand, queryCommand } from "./commands";

interface SearchResult {
  index: number,
  total: number,
  list: NodeList
}

export class ToolBar { // 编辑器工具栏class
  el: HTMLElement
  $body: HTMLElement
  config: Config
  callCommand: Function
  activeTab: string
  searchResult: SearchResult  
  constructor(el: HTMLElement, $body: HTMLElement, config: Config, callCommand: Function) {
    this.el = el;
    this.$body = $body;
    this.config = config;
    this.callCommand = callCommand;
    this.activeTab = null;
    this.searchResult = {
      index: 0,
      total: 0,
      list: null
    };
    this.init();
  }

  private init(): void { // 初始化工具栏
    this.config.toolLayOut === "tab" ? this.initTab() : this.initTool(this.config.tools);
    this.eventBind(); 
  }

  private initTab(): void { // 工具栏分组tab初始化
    const TabMap : { [index: string]: string } = { "base": "开始", "insert": "插入", "layout": "布局" };
    let $tabWrap = document.createElement("div");
    $tabWrap.className = "tool-bar__tab-wrap";
    this.el.appendChild($tabWrap);
    for(const key in this.config.toolTabs) {
      !this.activeTab && (this.activeTab = key);
      let $tab = document.createElement("span");
      $tab.className = `tool-bar__tab-item ${key} ${this.activeTab === key ? "is-active" : ""}`;
      $tab.innerText = TabMap[key];
      $tab.onclick = evt => this.setActiveTab.call(this, evt, key);
      $tabWrap.appendChild($tab);
      this.initTool(this.config.toolTabs[key], key); 
      $tab = null;
    }
  }

  private initTool(tools: Array<Tool | string>, tab?: string): void { // 初始化工具列表
    let $tool = document.createElement("div");
    $tool.className = `tool-bar__tool--${tab || "base"}`;
    if(!this.activeTab || this.activeTab === tab) {
      $tool.style.display = "block";
    }
    let tempTool = tools.map((tool: Tool | string) => {
      if(typeof tool === "string") {
        tool =  { name: this.config.toolMap[tool], key: tool };
      }
      $tool.appendChild(this.initToolItem(tool));
      return tool;
    });
    if(!tab) {
      this.config.tools = tempTool;
    }
    else {
      this.config.toolTabs[tab] = tempTool;
    } 
    this.el.appendChild($tool);
  }

  private eventBind(): void { // 事件绑定
    let vm = this;
    vm.hideAllPopper = this.hideAllPopper.bind(vm);
    $Z(document.body).on("click", this.hideAllPopper);
  }

  initToolItem(tool: Tool): HTMLElement { // 初始化单个工具
    let handler = tool.handler;
    tool.handler = (evt: UIEvent, tool: Tool, cmdParam?: string): boolean => {
      let result = !handler ? execCommand(tool.key, cmdParam) : handler(evt, tool.key, cmdParam);
      this.callCommand(tool);
      return result;
    };
    if(!tool.queryState) { // 指定默认的queryState方法
      tool.queryState = (): boolean | string => queryCommand(tool.key);
    }
    let $item: HTMLElement;
    switch(tool.key) {
      case "fontName": // 字体工具初始化
        tool.setState = () => this.selectFontName(tool);
        $item = this.initFontSelect(tool, this.config.fontOptions, { width: 100 });
        break;      
      case "foreColor": // 字体颜色工具
      case "backColor": // 背景色突出显示
        $item = this.initColorPicker(tool);
        break;
      case "fontSize": // 字号工具初始化
        tool.setState = () => this.selectFontSize(tool);
        $item = this.initFontSelect(tool, this.config.fontSizeOptions, {});
        break;
      case "search": // 查找工具
        $item = this.initSearch(tool);
        break;
      default: // bold, italic, underline, strikeThrough
        $item = this.initButton(tool);
        break;
    }
    tool.elm = $item;
    return $item;
  }

  // 初始化工具栏按钮 (bold italic underline strikeThrough)
  initButton(tool: Tool): HTMLElement {
    tool.setState = () => this.setButtonActive(tool); 
    let $button: HTMLElement = document.createElement("div");
    $button.className = "zeditor-tool__item " + tool.key;
    $button.title = tool.name;
    $button.innerHTML = `<i class="ze-icon-${tool.key}"></i>`;    
    $button.onclick = (evt: UIEvent) => {
      tool.handler && tool.handler(evt, tool);
    }    
    return $button;
  }

  // 初始化字体下拉选择工具（fontName & fontSize）
  initFontSelect(
    tool: Tool,
    options: Array<Option>,
    { top=28, height=300, width }: { top?: number, width?: number, height?: number }
  ): HTMLElement {
    let $select: HTMLElement = document.createElement("div");
    $select.className = `zeditor-tool__item ${tool.key} ze-arrow down`;
    $select.innerHTML = `<input type="text" class="zeditor-tool__input" />`;
    this.setSelectValue($select, options);
    // 创建弹出层
    let $popper = this.createPopper(options, { top, height, width }, (evt?: UIEvent, option?: Option) => {
      this.setSelectValue($select, options, option);
      tool.handler && tool.handler(evt, tool, option.key);
    });
    $select.appendChild($popper);
    // 下拉框事件绑定
    let vm = $Z($select);
    vm.on("click", (evt: UIEvent, target: HTMLElement) => {
      evt.stopPropagation();
      let flag = $select.className.indexOf("show");
      this.hideAllPopper();
      if(flag < 0) {        
        vm.toggleClass("show");
      }  
    });
    return $select;
  }

  // 初始化颜色选择工具( forceColor & hiliteColor)
  initColorPicker(tool: Tool): HTMLElement {
    tool.setState = () => this.selectColor.call(this, tool);
    let $picker: HTMLElement = document.createElement("div");
    $picker.className = `zeditor-tool__item ${tool.key} ze-arrow down`;
    $picker.innerHTML = `<i class="ze-icon-${tool.key}"></i><span class="color-block"></span>`;
    let $block: HTMLElement = $picker.querySelector(".color-block"); // 颜色指示器
    let $popper: HTMLElement = document.createElement("div");
    $popper.className = "ze-popper__wrap ze-color-picker";
    $popper.style.top = "28px";
    function createItems(color: Option): HTMLElement {
      let $colorItem = document.createElement("div");
      $colorItem.className = `ze-color-picker__item ${color.key === "rgb(255, 255, 255)" ? "is-white": ''}`;
      $colorItem.style.backgroundColor = color.key;
      $colorItem.onclick = (evt: UIEvent) => {
        $Z($picker.querySelectorAll(".ze-color-picker__item")).toggleClass("is-selected", false);
        $Z($colorItem).toggleClass("is-selected", true);
        $block.style.backgroundColor = color.key;
        $picker.title = color.value;
        tool.handler && tool.handler(evt, tool, color.key);
      }
      return $colorItem;
    }
    let $normalGroup = document.createElement("div");
    $normalGroup.className = "ze-color-picker__group--normal";   
    this.config.colorOptions.forEach((color: Option) => {
      $normalGroup.appendChild(createItems(color));
    });
    $popper.appendChild($normalGroup);
    let $standardGroup = document.createElement("div");
    $standardGroup.className = "ze-color-picker__group--standard";
    $standardGroup.innerHTML = '<div>标准色</div>';
    this.config.standerColors.forEach((color: Option) => {
      $standardGroup.appendChild(createItems(color));
    });
    $popper.appendChild($standardGroup);
    $picker.appendChild($popper);
    let vm = $Z($picker);
    vm.on("click", (evt: UIEvent, target: HTMLElement) => { // 事件绑定
      evt.stopPropagation();
      let flag = $picker.className.indexOf("show");
      this.hideAllPopper();
      if(flag < 0) {        
        vm.toggleClass("show");
      }  
    });
    return $picker;
  }

  // 初始化查找工具
  initSearch(tool: Tool): HTMLElement { 
    let $button: HTMLElement = document.createElement("div");
    $button.className = "zeditor-tool__item " + tool.key;
    $button.title = tool.name;
    $button.innerHTML = `<i class="ze-icon-${tool.key}"></i>`;    
    let $popper: HTMLElement = document.createElement("div");
    $popper.className = "ze-popper__wrap ze-search__wrap";
    $popper.innerHTML = `
      <div class="ze-search__banner">查找
        <i title="关闭" class="ze-icon-fork"></i>
      </div>
      <div class="ze-search__body" title="">        
        <div class="right-btns">
          <span class="ze-search__result"></span>
          <i title="下一个" class="ze-icon-arrow--down"></i>
          <i title="上一个" class="ze-icon-arrow--up"></i>
        </div>
        <div class="left-content">
          <input placeholder="输入查找内容" type="text" class="zeditor-tool__input" />
        </div>       
      </div>`;
    $popper.style.top = "28px";
    $button.appendChild($popper);
    let timeOut: any = null;
    let $input: HTMLInputElement = $popper.querySelector("input");
    let $result: HTMLElement = $popper.querySelector(".ze-search__result");
    let vm = $Z($button);
    vm.on("click", ".ze-icon-fork", (evt: UIEvent) => {
      vm.toggleClass("open");
      let $input = $popper.querySelector("input");    
      $input && ($input.value = "");
      $result.innerText = "";
      this.$body.style.paddingTop = "";
      this.cleanKeyWords();
    }).on("click", (evt: UIEvent) => {
      this.hideAllPopper();
      let clickTargtet: HTMLElement = evt.target as HTMLElement;
      if(!$popper.contains(clickTargtet)) {
        Promise.resolve().then(() => {
          $popper.querySelector("input").focus();
        });
        vm.toggleClass("open", true);
        this.$body.style.paddingTop = "60px";
      }
    }).on("keyup", "input", (evt: UIEvent, target: HTMLElement) => {
      clearTimeout(timeOut);
      timeOut = setTimeout(() => {
        this.findKeyWords($input.value);
        $result.innerText = `${this.searchResult.index}/${this.searchResult.total}`;
      }, 500);
    });
    return $button;
  }

  createPopper(options: Array<Option>, { top, width, height }: { top?: number, width?: number, height?: number}, change: Function): HTMLElement {
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

  setActiveTab(evt: UIEvent, tab: string ) {
    if(this.activeTab !== tab) {
      this.activeTab = tab;
      $Z(".zditor__wrap .tool-bar__tab-item").toggleClass("is-active", false);
      $Z("[class^='tool-bar__tool--']").toggle(false);
      $Z(evt.currentTarget).toggleClass("is-active", true);
      $Z(`.zditor__wrap .tool-bar__tool--${tab}`).toggle(true);
    }  
  }

  hideAllPopper() {
    $Z(".zeditor-tool__item").toggleClass("show", false);
  }

  setButtonActive(tool: Tool) { // 设置按钮的激活状态
    if(tool.queryState) {
      tool.elm.className = `zeditor-tool__item ${tool.key}${tool.queryState() ? ' is-active' : ''}`;
    }  
  }

  selectFontName(tool: Tool) { // 设置字体下拉框value
    if(tool.queryState) {
      let fontName: string = tool.queryState();
      this.setSelectValue(tool.elm, this.config.fontOptions, fontName);
    }
  }

  selectFontSize(tool: Tool) { // 设置字号下拉框value
    if(tool.queryState) {
      let fontSize: string = tool.queryState();
      // 计算系统dpi，进行pt与px的换算
      let tmpNode = document.createElement( "div" );
      let dpiY: number = 0;
      tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
      document.body.appendChild(tmpNode);
      dpiY = tmpNode.offsetHeight;
      document.body.removeChild(tmpNode);
      tmpNode = null;
      let $input: HTMLInputElement  = tool.elm.querySelector("input.zeditor-tool__input");
      fontSize && this.config.fontSizeOptions.forEach(option => {
        if(option.key.indexOf("pt") >= 0) { // 只支持pt和px俩种单位的字号选项
          if(parseFloat(option.key).toFixed(1) === (parseFloat(fontSize) * 72 / dpiY).toFixed(1)) {
            tool.elm.title = option.value;
            $input.value = option.value;
          }
        }
        else if(option.key.indexOf("px") >= 0) {
          if(parseFloat(option.key).toFixed(1) === parseFloat(fontSize).toFixed(1)) {
            tool.elm.title = option.value;
            $input.value = option.value;
          }
        }
      });
    }
  }

  selectColor(tool: Tool) { // 设置颜色选择器选中值
    if(tool.queryState) {
      let color: string = tool.queryState();
      let $block: HTMLElement = tool.elm.querySelector(".color-block");
      $block && ($block.style.backgroundColor = color);
      let $selected: HTMLElement = tool.elm.querySelector(".ze-color-picker__item.is-selected");
      $selected && ($selected.className = "ze-color-picker__item");
      $selected = tool.elm.querySelector(`.ze-color-picker__item[style*="color: ${color}"]`);
      $selected && ($selected.className = "ze-color-picker__item is-selected");
    }
  }

  setSelectValue(select: HTMLElement, options: Array<Option>, option?: Option | string) {
    let value: string = "";
    let $input: HTMLInputElement  = select.querySelector("input.zeditor-tool__input");
    if(typeof option === "string") {
      option = options.find(item => item.key === option);
    }
    option && (value = option.value);
    $input && ($input.value = value);
    select.title = value;
  }

  findKeyWords(keyWords: string) {
    this.cleanKeyWords();
    if(keyWords) {
      let html: string = this.$body.innerHTML;
      let reg: RegExp = new RegExp(keyWords, "mg");
      html = html.replace(reg, `<span class="ze-search__item">${keyWords}</span>`);
      this.$body.innerHTML = html;
      this.searchResult.list = this.$body.querySelectorAll(".ze-search__item");
      this.searchResult.index = 1;
      this.searchResult.total = this.searchResult.list.length;
    }
  }

  cleanKeyWords() {
    if(this.searchResult.list) {
      let html = this.$body.innerHTML;
      this.searchResult.list.forEach((item: HTMLElement) => {
        html = html.replace(item.outerHTML, item.innerText);
        item = null;
      });
      this.$body.innerHTML = html;
    }
    this.searchResult = { index: 0, total: 0, list: null };
  }
}

export default ToolBar;