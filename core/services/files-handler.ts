import * as fs from 'fs';

export interface IFilesHandler {
  exists(path: string): boolean;
  read(path: string): string;
  write(path: string, content: string): void;
}

export class FilesHandler implements IFilesHandler {
  public exists(path: string): boolean {
    return fs.existsSync(path);
  }

  public read(path: string): string {
    return fs.readFileSync(path, 'utf-8');
  }

  public write(path: string, content: string): void {
    fs.writeFileSync(path, content);
  }
}
