import { Controller, Get, Res, UseGuards } from "@nestjs/common"
import { FacebookAuthGuard, FacebookUser } from "@src/facebook"
import { UserFacebookLike } from "@src/facebook/types"
import { Response } from "express"
import { FacebookService } from "./facebook.service"

@Controller("auth/facebook")
export class FacebookController {
    constructor(private readonly facebookService: FacebookService) {}
    @UseGuards(FacebookAuthGuard)
    @Get("redirect")
    public async facebookRedirect() {
    }

    @UseGuards(FacebookAuthGuard)
    @Get("callback")
    public async facebookCallback(@FacebookUser() user: UserFacebookLike, @Res() res: Response) {
        const redirectUrl = await this.facebookService.facebookCallback(user)
        return res.redirect(redirectUrl)
    }
}
