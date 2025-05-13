import { Controller, Get, UseGuards } from "@nestjs/common"
import { FacebookAuthGuard, FacebookUser } from "@src/facebook"
import { UserFacebookLike } from "@src/facebook/types"
    
@Controller("auth/facebook")
export class FacebookController {
    @UseGuards(FacebookAuthGuard)
    @Get("redirect")
    public async facebookRedirect() {}

    @UseGuards(FacebookAuthGuard)
    @Get("callback")
    public async facebookCallback(@FacebookUser() user: UserFacebookLike) {
        console.log(user)
        return user
    }
}
