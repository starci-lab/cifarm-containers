import { Controller, Get, UseGuards } from "@nestjs/common"
import { GoogleAuthGuard, GoogleUser } from "@src/google-cloud"
import { UserLike } from "@src/jwt"

@Controller("auth/google")
export class GoogleController {
    @UseGuards(GoogleAuthGuard)
    @Get("redirect")
    public async googleRedirect() {}

    @UseGuards(GoogleAuthGuard)
    @Get("callback")
    public async googleCallback(@GoogleUser() user: UserLike) {
        console.log(user)
        return user
    }
}
