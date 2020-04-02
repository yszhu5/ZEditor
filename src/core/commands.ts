const getAllNodes = function(range: Range, callback?: Function): Array<Node> {
  let nodeList: Array<Node> = [];
  if(!range.collapsed) {
    let parent = range.commonAncestorContainer;
    if(parent.nodeType === 3) {
      callback && callback(parent);
      return [parent];
    }
    let childNodes: Array<Node> = getAllLeafNodes(parent);
    let min: number = childNodes.length - 1;
    let max: number = min;
    for(let i=0,len=childNodes.length; i<len; i++) {
      let node = childNodes[i];
      if(childNodes[i].contains(range.startContainer)) {
        min = i;
        node = range.startContainer;
      }
      if(childNodes[i].contains(range.endContainer)) {
        max = i;
        node = range.endContainer;
      }
      if(i >= min && i <= max) {
        nodeList.push(node);
        callback && callback(node);
      }
    }
  }
  else {
    nodeList.push(range.startContainer);
    callback && callback(range.startContainer);
  }
  return nodeList;
}

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

const queryFontName = function(): { fontName: string, fontNameList: Array<string> } {
  let fontName: string;
  let fontNameList: Array<string> = [];
  let selection = window.getSelection();
  for(let i=0; i<selection.rangeCount; i++) {
    let range = selection.getRangeAt(i);
    getAllNodes(range, (node: Node) => {
      let tempNode: HTMLElement = node as HTMLElement;
      if(node.nodeType === 3) {
        tempNode = node.parentNode as HTMLElement;
      }
      let font = getComputedStyle(tempNode).getPropertyValue("font-family");
      if(typeof fontName === "undefined") {
        fontName = font;
      }
      else if(fontName !== font) {
        fontName = null;
      }      
      fontNameList.push(font);
    });
  }
  return { fontName, fontNameList };
}

export const execCommand = function(cmdName: string, cmdParam?: string): boolean {
  return document.execCommand(cmdName, false, cmdParam || null);
}

export const queryCommand = function(cmdName: string): boolean | string {
  let result: boolean | string;
  switch(cmdName) {
    case "fontName": 
      result = queryFontName().fontName;
      break;    
    default: 
      result = document.queryCommandState(cmdName);
      break;
  }
  return result;
}