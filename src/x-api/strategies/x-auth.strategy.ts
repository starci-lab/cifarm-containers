import { envConfig } from "@src/env"
import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Profile, Strategy } from "@superfaceai/passport-twitter-oauth2"
import { UserXLike } from "../types"

@Injectable()
export class XAuthStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            clientID: envConfig().xApi.oauth.clientId,
            clientSecret: envConfig().xApi.oauth.clientSecret,
            callbackURL: envConfig().xApi.oauth.redirectUri,
            clientType: "confidential",
            scope: ["tweet.read", "users.read", "offline.access"],
        })
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (error: Error | null, user?: UserXLike) => void,
    ) {
        console.log(profile)
        const { name, emails, photos, id } = profile
        const user: UserXLike = {
            id,
            email: emails[0].value,
            name: name.givenName,
            picture: photos[0].value,
        }
        done(null, user)
    }
}