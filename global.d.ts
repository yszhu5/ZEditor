declare interface HTMLElement {
  style: {
    [index: string]: string
  },
  guid?: string,
  selectorGuid?: string,
  attachEvent?: Function,
  detachEvent?: Function
}

declare interface EventHandler {
  (e: UIEvent): void;
}

declare interface PromiseCallBack {
  (value?: any): void | PromiseLike<void>
}


