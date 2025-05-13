import { Controller, Get, UseGuards } from "@nestjs/common"
import { XAuthGuard, XUser } from "@src/x-api"
import { UserLike } from "@src/jwt"
    
@Controller("auth/x")
export class XController {
    @UseGuards(XAuthGuard)
    @Get("redirect")
    public async xRedirect() {}

    @UseGuards(XAuthGuard)
    @Get("callback")
    public async xCallback(@XUser() user: UserLike) {
        console.log(user)
        return user
    }
}
