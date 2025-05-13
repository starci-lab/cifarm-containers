import { envConfig, Network } from "@src/env"
import { Injectable, Logger } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Profile, Strategy } from "@superfaceai/passport-twitter-oauth2"
import { UserXLike } from "../types"
import { Request } from "express"

@Injectable()
export class XAuthStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(XAuthStrategy.name)
    constructor() {
        super({
            clientID: envConfig().xApi.oauth.clientId,
            clientSecret: envConfig().xApi.oauth.clientSecret,
            callbackURL: envConfig().xApi.oauth.redirectUri,
            clientType: "confidential",
            scope: ["tweet.read", "users.read", "offline.access"],
            passReqToCallback: true
        })
    }

    override authenticate(req: Request, options: any) {
        console.log(req.session.oauthState)
        console.log(options)    
        const { network } = JSON.parse(req.session.oauthState as string)
        super.authenticate(req, {
            state: JSON.stringify({ network })
        })
    }   

    async validate(
        req: Request,
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (error: Error | null, user?: UserXLike) => void
    ) {
        let network: Network = Network.Testnet
        console.log(req.session.oauthState)
        if (req.query.state) {
            try {
                const stateObj = JSON.parse(decodeURIComponent(req.session.oauthState as string))
                network = stateObj.network ?? Network.Testnet
            } catch (error: unknown) {
                this.logger.error(error)
            }
        }
        console.log(network)
        console.log(profile)
        const { name, emails, photos, id } = profile
        const user: UserXLike = {
            id,
            email: emails[0].value,
            username: name.givenName,
            picture: photos[0].value,
            network
        }
        done(null, user)
    }
}

export interface XProfile {
    username: string
}
