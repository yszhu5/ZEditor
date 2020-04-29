/*
 * 组件全局配置项，支持修改，作用于组件所有实例
 * yszhu5 2020-04-01
 */

export interface Option { // 下拉列表接口
  key: string, // 选项唯一标志
  value: string, // 选项名称
  default?: boolean // 是否为默认选项
};

export interface Tool { // 工具栏Tool接口
  name: string, // 工具名称
  key: string, // 工具唯一标志，对应execCommand的commandId
  handler?: Function, // 工具点击事件处理函数
  queryState?: Function, // 工具状态/计算值查询函数
  setState?: Function, // 设置工具状态/计算值的函数
  elm?: HTMLElement // 工具按钮对应的dom节点
}

export interface ToolTabs { // 工具栏中工具分组接口
  [index: string]: Array<Tool | string>,
  base: Array<Tool | string>,
  insert: Array<Tool | string>,
  layout: Array<Tool | string>
}

interface ToolMap { // 工具key-name的映射表接口
  [index: string]: string
}

export interface Config { // 全局配置接口
  toolLayOut?: string, // 工具栏布局方式，tab | line
  toolMap?: ToolMap, // 工具key-name映射表
  toolTabs?: ToolTabs, // toolLayOut为tab时必选，对tools中所有工具进行分组配置，系统工具直接传入字符串，用户自定义工具传入Tool对象
  tools?: Array<Tool | string> // toolLayOut为line时，所有工具对象列表，系统工具直接传入字符串，用户自定义工具传入Tool对象
  fontOptions?: Array<Option>, // 字体列表配置
  fontSizeOptions?: Array<Option>, // 字号列表配置
  colorOptions?: Array<Option>, // 颜色列表配置
  standerColors?: Array<Option> // 标准色列表配置
}

const toolMap: ToolMap = { // 默认的工具key-name列表映射
  undo: "撤销",
  redo: "重做",
  fontName: "字体",
  fontSize: "字号",
  bold: "加粗",
  italic: "斜体",
  underline: "下划线",
  strikeThrough: "删除线",
  subscript: "下标",
  superscript: "上标",
  foreColor: "字体颜色",
  backColor: "突出显示",
  justifyLeft: "左对齐",
  justifyCenter: "居中对齐",
  justifyRight: "右对齐",
  justifyFull: "俩端对齐",
  lineHeight: "行间距",
  selectAll: "全选",
  removeFormat: "清除格式",
  search: "查找",
  replace: "替换",
  insertLink: "插入超链接",
  insertTable: "插入表格",
  insertImage: "插入图片",
  insertUnorderedList: "插入无序列表",
  insertOrderedList: "插入有序列表",
  insertChar: "插入特殊字符",
  insertTime: "插入日期时间",
  insertRemark: "插入批注"
};

export const defaults: Config = {
  toolLayOut: "tab",
  toolTabs: {
    base: [
      "undo",
      "redo",
      "fontName",
      "fontSize",
      "bold",
      "italic",
      "underline",
      "strikeThrough",
      "subscript",
      "superscript",
      "foreColor",
      "backColor",
      "justifyLeft",
      "justifyCenter",
      "justifyRight",
      "justifyFull",
      "lineHeight",
      "selectAll",
      "removeFormat",
      "search",
      "replace"
    ],
    insert: [
      "insertLink",
      "insertTable",
      "insertImage", 
      "insertUnorderedList",
      "insertOrderedList",
      "insertChar",
      "insertTime",
      "insertRemark"
    ],
    layout: []
  },
  toolMap: toolMap,
  tools: Object.keys(toolMap),
  fontOptions: [
    { key: `微软雅黑, "Microsoft YaHei"`, value: "微软雅黑", default: true },
    { key: `宋体, SimSun`, value: "宋体" },
    { key: "FangSong", value: "仿宋" },
    { key: "FangSong_GB2312", value: "仿宋GB_2312" },
    { key: "YouYuan", value: "幼圆" },
    { key: "KaiTi", value: "楷体" },
    { key: "黑体, SimHei", value: "黑体" },
    { key: "隶书, SimLi", value: "隶书" },
    { key: "arial", value: "arial" }   
  ],
  fontSizeOptions: [
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
    { key: "9pt", value: "小五" }
  ],
  colorOptions: [
    { key: "rgb(255, 255, 255)", value: ""},
    { key: "rgb(0, 0, 0)", value: ""},
    { key: "rgb(231, 230, 230)", value: ""},
    { key: "rgb(68, 84, 106)", value: ""},
    { key: "rgb(91, 155, 213)", value: ""},
    { key: "rgb(237, 125, 49)", value: ""},
    { key: "rgb(165, 165, 165)", value: ""},
    { key: "rgb(255, 192, 0)", value: ""},
    { key: "rgb(68, 114, 196)", value: ""},
    { key: "rgb(112, 173, 71)", value: ""},  
    { key: "rgb(242, 242, 242)", value: ""},
    { key: "rgb(128, 128, 128)", value: ""},
    { key: "rgb(208, 206, 206)", value: ""},
    { key: "rgb(214, 220, 229)", value: ""},
    { key: "rgb(222, 235, 247)", value: ""},
    { key: "rgb(251, 229, 214)", value: ""},
    { key: "rgb(237, 237, 237)", value: ""},
    { key: "rgb(255, 242, 204)", value: ""},
    { key: "rgb(218, 227, 243)", value: ""},
    { key: "rgb(226, 240, 217)", value: ""},
    { key: "rgb(217, 217, 217)", value: ""},
    { key: "rgb(89, 89, 89)", value: ""},
    { key: "rgb(175, 171, 171)", value: ""},
    { key: "rgb(173, 185, 202)", value: ""},
    { key: "rgb(189, 215, 238)", value: ""},
    { key: "rgb(248, 203, 173)", value: ""},
    { key: "rgb(219, 219, 219)", value: ""},
    { key: "rgb(255, 230, 153)", value: ""},
    { key: "rgb(180, 199, 231)", value: ""},
    { key: "rgb(197, 224, 180)", value: ""},  
    { key: "rgb(191, 191, 191)", value: ""},
    { key: "rgb(64, 64, 64)", value: ""},
    { key: "rgb(118, 113, 113)", value: ""},
    { key: "rgb(132, 151, 176)", value: ""},
    { key: "rgb(157, 195, 230)", value: ""},
    { key: "rgb(244, 177, 131)", value: ""},
    { key: "rgb(201, 201, 201)", value: ""},
    { key: "rgb(255, 217, 102)", value: ""},
    { key: "rgb(143, 170, 220)", value: ""},
    { key: "rgb(169, 209, 142)", value: ""},  
    { key: "rgb(166, 166, 166)", value: ""},
    { key: "rgb(38, 38, 38)", value: ""},
    { key: "rgb(59, 56, 56)", value: ""},
    { key: "rgb(51, 63, 80)", value: ""},
    { key: "rgb(46, 117, 182)", value: ""},
    { key: "rgb(197, 90, 17)", value: ""},
    { key: "rgb(124, 124, 124)", value: ""},
    { key: "rgb(191, 144, 0)", value: ""},
    { key: "rgb(47, 85, 151)", value: ""},
    { key: "rgb(84, 130, 53)", value: ""},  
    { key: "rgb(127, 127, 127)", value: ""},
    { key: "rgb(13, 13, 13)", value: ""},
    { key: "rgb(24, 23, 23)", value: ""},
    { key: "rgb(34, 42, 53)", value: ""},
    { key: "rgb(31, 78, 121)", value: ""},
    { key: "rgb(132, 60, 11)", value: ""},
    { key: "rgb(83, 83, 83)", value: ""},
    { key: "rgb(127, 96, 0)", value: ""},
    { key: "rgb(32, 56, 100)", value: ""},
    { key: "rgb(56, 87, 35)", value: ""}
  ],
  standerColors: [
    { key: "rgb(192, 0, 0)", value: ""},
    { key: "rgb(255, 0, 0)", value: ""},
    { key: "rgb(255, 192, 0)", value: ""},
    { key: "rgb(255, 255, 0)", value: ""},
    { key: "rgb(146, 208, 80)", value: ""},
    { key: "rgb(0, 176, 80)", value: ""},
    { key: "rgb(0, 176, 240)", value: ""},
    { key: "rgb(0, 112, 192)", value: ""},
    { key: "rgb(0, 32, 96)", value: ""},
    { key: "rgb(112, 48, 160)", value: ""}
  ]
};