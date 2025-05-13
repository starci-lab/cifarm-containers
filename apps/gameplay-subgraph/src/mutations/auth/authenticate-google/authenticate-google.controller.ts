import { Controller, Get, UseGuards } from "@nestjs/common"
import { GoogleAuthGuard, GoogleUser } from "@src/google-cloud"

import { UserLike } from "@src/jwt"
@Controller("auth/google")
export class AuthenticateGoogleController {
    @UseGuards(GoogleAuthGuard)
    @Get("login")
    public async googleLogin() {}

    @UseGuards(GoogleAuthGuard)
    @Get("callback")
    public async googleCallback(@GoogleUser() user: UserLike) {
        console.log(user)
        return user
    }
}
