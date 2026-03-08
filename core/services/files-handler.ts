import * as fs from 'fs';
import * as path from 'path';

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

  public write(filePath: string, content: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content);
  }
}
