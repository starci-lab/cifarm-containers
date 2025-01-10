import { Injectable, Logger } from "@nestjs/common"
import { readFileSync, writeFileSync } from "fs"

@Injectable()
export class FileSystemService {
    private readonly logger = new Logger(FileSystemService.name)
    constructor() {}

    read({ fileDir, encoding }: ReadParams) : Buffer | string {
        encoding = encoding || "utf-8"
        this.logger.log(`Reading file from ${fileDir}`)
        return readFileSync(fileDir, encoding)
    }

    write({ fileDir, data }: WriteParams): void {
        this.logger.log(`Writing file to ${fileDir}`)
        writeFileSync(fileDir, data)
    }
}

export interface ReadParams {
    fileDir: string
    encoding?: BufferEncoding
}

export interface WriteParams {
    fileDir: string
    data: string
}
