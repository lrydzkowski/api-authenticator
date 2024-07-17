export interface ILogger {
  logInfo(msg: string): void;
  logError(msg: string): void;
}

export class Logger implements ILogger {
  public logInfo(msg: string): void {
    console.log(msg);
  }

  public logError(msg: string): void {
    console.error(msg);
  }
}
