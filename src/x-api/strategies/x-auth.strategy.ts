import { envConfig, Network } from "@src/env"
import { Injectable, Logger } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "@superfaceai/passport-twitter-oauth2"
import { UserXLike } from "../types"
import { Request } from "express"
import { SerializationService } from "@src/crypto"

export interface XAuthState {
    network: Network
}

@Injectable()
export class XAuthStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(XAuthStrategy.name)
    constructor(
        private readonly serializationService: SerializationService,
    ) {
        super({
            clientID: envConfig().xApi.oauth.clientId,
            clientSecret: envConfig().xApi.oauth.clientSecret,
            callbackURL: envConfig().xApi.oauth.redirectUri,
            clientType: "confidential",
            scope: ["tweet.read", "users.read", "offline.access"],
            passReqToCallback: true
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async authenticate(req: Request, options: any) {
        // check if this is a redirect not callback
        let state = undefined
        if (!req.query.state) {
            state = this.serializationService.serializeToBase64<XAuthState>({
                network: req.query.network as Network || Network.Testnet
            })
        }
        super.authenticate(req, {
            ...options,
            state
        })
    } 
    
    async validate(
        req: Request,
        accessToken: string,
        refreshToken: string,
        profile: TwitterProfile,
        done: (error: Error | null, user?: UserXLike) => void
    ) {
        const state = this.serializationService.deserializeFromBase64<XAuthState>(req.query.state as string)
        const { username, displayName, photos, id } = profile
        const user: UserXLike = {
            id,
            email: username,
            username: displayName,
            picture: photos[0].value,
            network: state.network
        }
        done(null, user)
    }
}

interface TwitterProfile {
    id: string;
    username: string;
    displayName: string;
    profileUrl: string;
    photos: Array<{
      value: string;
    }>;
    provider: string;
  }