import { Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
// extend jwt, google
export class GoogleAuthGuard extends AuthGuard("google") {
    constructor() {
        super()
    }
}