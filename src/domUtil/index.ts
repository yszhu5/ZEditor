const domUtilEventList = new Map();
const windowEvent: Array<EventHandler> = [];
interface EvtItem {
  evtName: string,
  selector: string,
  target: HTMLElement,
  call: Function,
  handler: Function
};

// 基础的dom操作封装
class DomUtil {
  [index: number]: HTMLElement //可索引声明
  length: number
  constructor(selector: string | HTMLElement | NodeList) {
    let nodes: NodeList | Array<HTMLElement>;
    if(typeof selector === 'string') {
      nodes = document.querySelectorAll(selector);
    }
    else if(selector instanceof HTMLElement) {
      nodes = [selector];
    }
    else if(selector instanceof NodeList) {
      nodes = selector;
    }
    [...nodes].map((node: HTMLElement, index: number) => {
      this[index] = node;
      return node;
    });
    // 添加length属性
    this.length = nodes.length;
    nodes = null;    
  }
  // 添加iterable迭代器属性
  private [Symbol.iterator]() {
    let index: number = 0;
    let vm = this;
    return {
      next(): { value: HTMLElement, done: boolean } {
        let done: boolean = index >= vm.length;
        return {
          value: done ? null :  vm[index++],
          done: done
        }
      }
    };
  };
  // 事件委托
  on(event: string, childSelector?: string | Function, callback?: Function) {
    let selector: string;
    if(typeof childSelector === "function") {
      !callback && (callback = childSelector);
      selector = null;
    }
    else {
      selector = childSelector;
    }
    if(this.length) {
      for(let item of this) {
        addEvent.bind(item)(event, function handler(evt: Event): void {
          let target = (getTarget(item, evt.target, selector) as HTMLElement);
          if(target) {
            callback && callback(evt, target);
            let evtItem: EvtItem = {
              evtName: event,
              selector: selector,
              target: target,
              call: callback,
              handler: handler
            };
            let evtList = domUtilEventList.get(item);
            if(evtList) {
              evtList.push(evtItem);
            }
            else {
              domUtilEventList.set(item, [ evtItem ]);
            }
          }
        });
      }
    }
    return this;
  }
  // 事件解绑
  off(event: string, childSelector?: string | Function, callback?: Function) {
    let selector: string;
    if(typeof childSelector === "function") {
      !callback && (callback = childSelector);
      selector = null;
    }
    else {
      selector = childSelector;
    }
    for(let item of this) {
      let evtList = domUtilEventList.get(item);
      let nodes: NodeList | Array<HTMLElement> = selector ? item.querySelectorAll(selector) : [item];
      evtList.filter((evtItem: EvtItem) => {
        let callMatch: boolean = callback ? (callback === evtItem.call) : true;
        let evtMath: boolean = (event === evtItem.evtName);
        let target = [...nodes].find((node: HTMLElement) => node === evtItem.target);
        if(target && evtMath && callMatch) { //匹配上了,此时解除事件绑定
          delEvent.bind(item)(event, evtItem.handler);
          return true;
        }
        else {
          return false;
        }
      });
    }
    return this;
  };
  // 显示或隐藏
  toggle(state?: boolean): DomUtil {
    for(let item of this) {
      if(item) {
        let flag: boolean = false;
        if(item.style.display && item.style.display === "none") {
          item.style.display = "";
          flag = true;
        }        
        let cssDisPlay: string = getComputedStyle(item).getPropertyValue("display");
        if(cssDisPlay === "none") {
          cssDisPlay = "block";
          flag = true;
        }
        typeof state !== "undefined" && (flag = state); 
        item.style.display = flag ? cssDisPlay : "none";
      }
    }
    return this;
  };
  // class 样式的切换
  toggleClass(tempClass: string, state?: boolean): DomUtil {
    for(let item of this) {
      if(item) {
        if(typeof state === "undefined") {
          state = !(item.className.indexOf(tempClass) >= 0);
        }
        if(state) {
          item.className += ` ${tempClass}`;
        }
        else {  
          let classList = item.className.split(" ");
          let index = classList.indexOf(tempClass);
          index >= 0 && classList.splice(index, 1);
          item.className = classList.join(" ");
        }
      }
    }
    return this;
  }
};

// 事件绑定
function addEvent(this: HTMLElement, event: string, handler: EventHandler): HTMLElement { 
  let eventFun = this.addEventListener ? this.addEventListener : this.attachEvent;
  eventFun.bind(this)(event, handler);
  return this;
}

// 事件解绑
function delEvent(this: HTMLElement, event: string, handler: EventHandler): HTMLElement {  
  let eventFun = this.removeEventListener ? this.removeEventListener : this.detachEvent;
  eventFun.bind(this)(event, handler);
  return this;
}
// 查找具备祖先关系的俩个节点匹配选择器的中间节点
function getTarget(parent: HTMLElement, child: any, selector?: string): HTMLElement { 
  if(!selector) {
    return parent;
  }
  let target: HTMLElement = null;
  let targets: NodeList = parent.querySelectorAll(selector);
  if(targets && targets.length) {
    while(child !== parent) {
      if([...targets].find((elem: HTMLElement): boolean => elem === child)) {
        target = child;
        break;
      }
      else {
        child = child.parentNode;
      }
    }
  }
  targets = null;  
  return target;
};

// window对象添加resize事件
function onResize(handler: EventHandler) {
  addEvent.bind(window)("resize", handler);
  windowEvent.push(handler);
}

const $Z = function(selector: any): DomUtil {
  return new DomUtil(selector);
}

// 静态方法
$Z.getTarget = getTarget;
$Z.onResize = onResize;

export default $Z;