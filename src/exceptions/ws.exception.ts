import { WsException } from "@nestjs/websockets"

export class WsAuthTokenNotFoundException extends WsException {
    constructor() {
        super("Auth token not found")
    }
}

export class WsUnauthorizedException extends WsException {
    constructor() {
        super("Unauthorized")
    }
}  

