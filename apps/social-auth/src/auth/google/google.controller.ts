import { Controller, Get, Query, Req, Res, UseGuards } from "@nestjs/common"
import { GoogleAuthGuard, GoogleUser } from "@src/google-cloud"
import { UserGoogleLike } from "@src/google-cloud"
import { GoogleService } from "./google.service"
import { Response } from "express"
import { Network } from "@src/env"
import { Request } from "express"

@Controller("auth/google")
export class GoogleController {
    constructor(private readonly googleService: GoogleService) {}
    @UseGuards(GoogleAuthGuard)
    @Get("redirect")
    public async googleRedirect(@Query("network") network: Network, @Req() req: Request) {
        network = network || Network.Testnet
        req.session.oauthState = JSON.stringify({ network }) // store it for later if needed
    }

    @UseGuards(GoogleAuthGuard)
    @Get("callback")
    public async googleCallback(@GoogleUser() user: UserGoogleLike, @Res() res: Response) {
        const redirectUrl = await this.googleService.googleCallback(user)
        return res.redirect(redirectUrl)
    }
}
