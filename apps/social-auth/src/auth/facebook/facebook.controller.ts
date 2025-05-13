import { Controller, Get, Query, Req, Res, UseGuards } from "@nestjs/common"
import { FacebookAuthGuard, FacebookUser } from "@src/facebook"
import { UserFacebookLike } from "@src/facebook/types"
import { Response } from "express"
import { FacebookService } from "./facebook.service"
import { Network } from "@src/env"
import { Request } from "express"

@Controller("auth/facebook")
export class FacebookController {
    constructor(private readonly facebookService: FacebookService) {}
    @UseGuards(FacebookAuthGuard)
    @Get("redirect")
    public async facebookRedirect(@Query("network") network: Network, @Req() req: Request) {
        network = network || Network.Testnet
        req.session.oauthState = JSON.stringify({ network }) // store it for later if needed
    }

    @UseGuards(FacebookAuthGuard)
    @Get("callback")
    public async facebookCallback(@FacebookUser() user: UserFacebookLike, @Res() res: Response) {
        const redirectUrl = await this.facebookService.facebookCallback(user)
        return res.redirect(redirectUrl)
    }
}
