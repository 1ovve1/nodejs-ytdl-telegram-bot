import * as fs from "node:fs";

export interface FileSystemServiceInterface {
    delete(readStream: fs.ReadStream): void;
}

export class FileSystemService implements FileSystemServiceInterface {
    delete(readStream: fs.ReadStream): void {
        readStream.destroy()

        fs.unlink(readStream.path, (err) => {
            if (err instanceof Error) {
                throw new Error();
            }
        });
    }
}