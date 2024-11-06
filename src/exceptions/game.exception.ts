import { HttpException, HttpStatus } from "@nestjs/common"

export class VersionAlreadyExistsException extends HttpException {
    constructor(version: string) {
        super(`Version already exists: ${version}`, HttpStatus.CONFLICT)
    }
}