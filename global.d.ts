declare interface Element {
  guid?: string,
  selectorGuid?: string,
  attachEvent?: Function,
  detachEvent?: Function
}

declare interface EventHandler {
  (e: UIEvent): void;
}