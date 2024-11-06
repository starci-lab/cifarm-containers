import { HttpException, HttpStatus } from "@nestjs/common"

export class CacheNotFound extends HttpException {
    constructor(key: string) {
        super(`Cache entry with key not found: ${key}`, HttpStatus.NOT_FOUND)
    }
}
