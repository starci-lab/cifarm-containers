import { Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class XAuthGuard extends AuthGuard("twitter") {
    constructor() {
        super()
    }
}