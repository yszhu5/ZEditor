import $Z from "../domUtil/index";

// 获取Range覆盖的所有node节点
const getAllNodes = function(range: Range, callback?: Function): Array<Node> {
  let nodeList: Array<Node> = []; // node节点数组
  let parent = range.commonAncestorContainer;
  if(parent.nodeType === 3 || (parent === range.startContainer)) {
    callback && callback(parent);
    return [parent];
  }
  let childNodes: NodeList = parent.childNodes;
  let min: number = childNodes.length - 1;
  let max: number = min;
  for(let i=0,len=childNodes.length; i<len; i++) {
    let node = childNodes[i];
    let contains: Array<Node> = [];
    if(childNodes[i].contains(range.startContainer)) { //匹配Range起始节点
      min = i;
      contains = getSiblings(range.startContainer, "next", node);
    }
    if(childNodes[i].contains(range.endContainer)) { //匹配Range的终止节点
      max = i;
      contains = getSiblings(range.endContainer, "prev", node);
    }
    if(!!contains.length) { //处理首尾节点的子节点
      for(let j=0,jLen=contains.length; j<jLen; j++) {
        nodeList.push(contains[j]);
        callback && callback(contains[j]);
      }
    }
    if(i > min && i < max) { //Range的中间节点直接push不需要遍历子节点
      nodeList.push(node);
      callback && callback(node);
    }
  }
  return nodeList;
}

// 向前|向后获取目标节点的所有兄弟节点
const getSiblings = function(node: Node, type: string="next", parent?: Node, nodeList?: Array<Node>): Array<Node> {
  !nodeList && (nodeList = []);
  !parent && (parent = node.parentNode);
  if(node === parent) {
    return [node];
  }
  let nodes: NodeList = parent.childNodes;
  let len = nodes.length;
  let findFlag = len;
  for(let i=0; i<len; i++) {
    if(nodes[i].contains(node)) {
      findFlag = i;
      nodes[i] === node ?  nodeList.push(nodes[i]) : getSiblings(node, type, nodes[i], nodeList);
    }
    let condition = type === "next" ? i > findFlag : i < findFlag;
    if(!!condition) {
      nodeList.push(nodes[i]);
    }
  }
  return nodeList;
}

// 获取Node节点的所有叶子节点集合
const getAllLeafNodes = function(node: Node, list?: Array<Node>): Array<Node> {
  !list && (list = []);
  let len = node.childNodes.length;
  if(!len) {
    list.push(node);
  }
  else {
    for(let i=0; i<len; i++) {
      list = getAllLeafNodes(node.childNodes[i], list);
    }
  }
  return list;
}

// 替换自身节点
const replaceWith = function(target: Node, nodes: Array<Node>) {
  let parent = target.parentNode;
  let reference: Node = null;
  let nodeList = parent.childNodes;
  let len = nodes.length;
  nodeList.forEach((node: Node, index: number) => {
    if(target === node) {
      reference = nodeList[index + 1];
      parent.removeChild(target);
    }
  });
  if(reference) {
    for(let i=len-1; i>=0; i--) {
      if(nodes[i]) {
        parent.insertBefore(nodes[i], reference);
        reference = nodes[i];
      }
    }
  }
  else {
    for(let i=0; i<len; i++) {
      nodes[i] && parent.appendChild(nodes[i]);
    }
  }
}

// 设置当前选区的字号
const setFontSize = function(fontSize: string): boolean {
  if(!fontSize) {
    return false;
  }
  let selection = window.getSelection();
  for(let i=0; i<selection.rangeCount; i++) {
    let range = selection.getRangeAt(i);
    let newRange = document.createRange();
    if(!range.collapsed) {
      getAllNodes(range, (node: HTMLElement): void => {
        selection.removeRange(range);
        let start: number;
        let end: number;
        node === range.startContainer && (start = range.startOffset);
        node === range.endContainer && (end = range.endOffset);
        if(node.nodeType === 3) { // 文本节点
          if(node.parentNode.childNodes.length === 1 && !start && (!end || end === node.nodeValue.length)) { //父节点拥有唯一子节点
            $Z(node.parentNode).setStyle("font-size", fontSize);
            start !== undefined && newRange.setStart(node, start); // 重设range起始节点
            end !== undefined && newRange.setEnd(node, end); // 重设range结束节点
          }
          else {
            let $span = document.createElement("span");
            $span.innerText = node.nodeValue.substring(start, end);
            $span.style.fontSize = fontSize;
            let $prev: Text = !!start ? document.createTextNode(node.nodeValue.substring(0, start)) : null;
            let $next: Text = !!end ? document.createTextNode(node.nodeValue.substring(end)) : null;
            start !== undefined && newRange.setStart($span, 0); // 重设range起始节点
            end !== undefined && newRange.setEnd($span, 1); // 重设range结束节点
            replaceWith(node, [$prev, $span, $next]);
          }        
        }
        else { // 非文本节点
          if(start === undefined && end === undefined) { // 属于中间节点，直接设置字体          
            $Z(node).setStyle("font-size", fontSize);
          }
          else {         
            start !== undefined && newRange.setStart(node, start);
            end !== undefined && newRange.setEnd(node, end);
            if(start === 0 && end === 1) { // 代表拥有唯一子节点，直接设置父节点字体
              $Z(node).setStyle("font-size", fontSize);
            }
            else {
              let nodes = node.childNodes;
              let min = start || 0;
              let max = end || nodes.length;            
              nodes.forEach((item: Node, index: number) => {
                if(index >= min && index <= max) {
                  if(item.nodeType === 3) {
                    let $span = document.createElement("span");
                    $span.innerText = item.nodeValue;
                    $span.style.fontSize = fontSize;
                    replaceWith(item, [$span]);
                  }
                  else {
                    $Z(item).setStyle("font-size", fontSize);
                  }
                }
              });
            }
          }
        }
      });
      selection.addRange(newRange);
    }
    else {
      execCommand("insertHTML", `<span style="font-size: ${fontSize}">&#8203;</span>`);
      selection.collapseToEnd();
    }
  }  
}

// 查询当前选取的字号
const queryFontSize = function(): string {
  let selection = window.getSelection();
  let fontSize: string;
  for(let i=0; i<selection.rangeCount; i++) {
    let range = selection.getRangeAt(i);
    let node: HTMLElement = getAllNodes(range)[0] as HTMLElement;
    if(!node) {
      return "";
    }
    if(node.nodeType === 3) {
      fontSize = getComputedStyle(node.parentNode as HTMLElement).getPropertyValue("font-size");
    }
    else {
      let index = range.startOffset > 0 ? (range.startOffset - 1) : 0;
      let temp = node.childNodes[index] as HTMLElement;
      if(!temp || temp.nodeType === 3) {
        temp = node;
      }
      fontSize = getComputedStyle(temp).getPropertyValue("font-size");
    }
  }
  return fontSize;
}

// 插入html片段
const insertHTML = function(cmdParam: string): boolean {
  let selection = window.getSelection();
  console.log(selection);
  let $div = document.createElement("div");
  $div.innerHTML = cmdParam;
  for(let i=0; i< selection.rangeCount; i++) {
    let range = selection.getRangeAt(i);
    range.deleteContents();
    if(i === 0) {
      let len = $div.childNodes.length;
      for(let i=len - 1; i>=0; i--) {
        let tempNode = $div.childNodes[i];
        range.insertNode(tempNode);
        if(i === 0) {
          range.setStart(tempNode, 0);
        }
        if(i === len - 1) {
          range.setEndAfter(tempNode);
        } 
      }
    }
  }
  $div = null;
  return false;
}

export const execCommand = function(cmdName: string, cmdParam?: string): boolean {
  let result: boolean;
  switch(cmdName) {
    case "fontSize": 
      result = setFontSize(cmdParam);
      break;
    case "insertHTML":
      result = insertHTML(cmdParam);
      break;
    default: 
      result = document.execCommand(cmdName, false, cmdParam || null);
  }
  return result;
}

export const queryCommand = function(cmdName: string): boolean | string {
  let result: boolean | string;
  switch(cmdName) {
    case "fontName":
    case "foreColor":
    case "backColor":
      result = document.queryCommandValue(cmdName);
      break;
    case "fontSize": 
      result = queryFontSize();
      break;
    default: 
      result = document.queryCommandState(cmdName);
  }
  return result;
}