import { HttpException, HttpStatus } from "@nestjs/common"

export class TelegramAuthorizationFailedException extends HttpException {
    constructor(message: string) {
        super(`Telegram authorization failed: ${message}`, HttpStatus.FORBIDDEN)
    }
}