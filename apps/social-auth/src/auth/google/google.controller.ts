import { Controller, Get, Res, UseGuards } from "@nestjs/common"
import { GoogleAuthGuard, GoogleUser } from "@src/google-cloud"
import { UserGoogleLike } from "@src/google-cloud"
import { GoogleService } from "./google.service"
import { Response } from "express"

@Controller("auth/google")
export class GoogleController {
    constructor(private readonly googleService: GoogleService) {}
    @UseGuards(GoogleAuthGuard)
    @Get("redirect")
    public async googleRedirect() {
    }

    @UseGuards(GoogleAuthGuard)
    @Get("callback")
    public async googleCallback(@GoogleUser() user: UserGoogleLike, @Res() res: Response) {
        const redirectUrl = await this.googleService.googleCallback(user)
        return res.redirect(redirectUrl)
    }
}
