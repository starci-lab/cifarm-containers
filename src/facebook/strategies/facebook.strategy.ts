import { envConfig, Network } from "@src/env"
import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Profile, Strategy } from "passport-facebook"
import { UserFacebookLike } from "../types"
import { Request } from "express"
import { Logger } from "@nestjs/common"
@Injectable()
export class FacebookAuthStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(FacebookAuthStrategy.name)
    constructor() {
        super({
            clientID: envConfig().facebook.oauth.clientId,
            clientSecret: envConfig().facebook.oauth.clientSecret,
            callbackURL: envConfig().facebook.oauth.redirectUri,
            passReqToCallback: true
        })
    }

    async validate(
        req: Request,
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (error: Error | null, user?: UserFacebookLike) => void,
    ) {
        let network: Network = Network.Testnet
        if (req.query.state) {
            try {
                const stateObj = JSON.parse(decodeURIComponent(req.query.state as string))
                network = stateObj.network ?? Network.Testnet
            } catch (error: unknown) {
                this.logger.error(error)
            }
        }
        const { name, emails, photos, id } = profile
        const user: UserFacebookLike = {
            id,
            email: emails[0].value,
            name: name.givenName,
            picture: photos[0].value,
            network
        }
        done(null, user)
    }
}