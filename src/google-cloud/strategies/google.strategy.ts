import { envConfig } from "@src/env"
import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Profile, Strategy } from "passport-google-oauth20"
import { UserLike } from "@src/jwt"

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            clientID: envConfig().googleCloudOAuth.clientId,
            clientSecret: envConfig().googleCloudOAuth.clientSecret,
        })
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
    ): Promise<UserLike> {
        const { name, emails, photos } = profile
        return {
            id: profile.id,
            email: emails[0].value,
            username: name.givenName,
            avatarUrl: photos[0].value,
        }
    }
}