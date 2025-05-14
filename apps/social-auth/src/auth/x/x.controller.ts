import { Controller, Get, Res, UseGuards } from "@nestjs/common"
import { UserXLike, XAuthGuard, XUser } from "@src/x-api"
import { XService } from "./x.service"
import { Response } from "express"
    
@Controller("auth/x")
export class XController {
    constructor(private readonly xService: XService) {}
    @UseGuards(XAuthGuard)
    @Get("redirect")
    public async xRedirect() {}

    @UseGuards(XAuthGuard)
    @Get("callback")
    public async xCallback(@XUser() user: UserXLike, @Res() res: Response) {
        const redirectUrl = await this.xService.xCallback(user)
        return res.redirect(redirectUrl)
    }
}
