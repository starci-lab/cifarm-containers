import { envConfig } from "@src/env"
import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Profile, Strategy } from "passport-facebook"
import { UserFacebookLike } from "../types"

@Injectable()
export class FacebookAuthStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            clientID: envConfig().facebook.oauth.clientId,
            clientSecret: envConfig().facebook.oauth.clientSecret,
            callbackURL: envConfig().facebook.oauth.redirectUri,
        })
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (error: Error | null, user?: UserFacebookLike) => void,
    ) {
        console.log(profile)
        const { name, emails, photos, id } = profile
        const user: UserFacebookLike = {
            id,
            email: emails[0].value,
            name: name.givenName,
            picture: photos[0].value,
        }
        done(null, user)
    }
}