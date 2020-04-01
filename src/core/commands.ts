export const execCommand = function(cmdName: string, cmdParam?: string): boolean {
  return document.execCommand(cmdName, false, cmdParam || null);
}

export const queryCommand = function(cmdName: string): boolean {
  return document.queryCommandState(cmdName);
}