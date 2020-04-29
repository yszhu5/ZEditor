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


