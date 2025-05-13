import { envConfig, Network } from "@src/env"
import { Injectable, Logger } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20"
import { UserGoogleLike } from "../types"
import { Request } from "express"

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(GoogleAuthStrategy.name)
    constructor() {
        super({
            clientID: envConfig().googleCloud.oauth.clientId,
            clientSecret: envConfig().googleCloud.oauth.clientSecret,
            callbackURL: envConfig().googleCloud.oauth.redirectUri,
            scope: ["email", "profile"],
            passReqToCallback: true
        })
    }

    async validate(
        req: Request,
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
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
        const user: UserGoogleLike = {
            id,
            email: emails[0].value,
            name: name.givenName,
            picture: photos[0].value,
            network
        }
        done(null, user)
    }
}
