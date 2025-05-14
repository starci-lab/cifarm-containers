import { envConfig, Network } from "@src/env"
import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "passport-facebook"
import { UserFacebookLike } from "../types"
import { Request } from "express"
import { Logger } from "@nestjs/common"
import { SerializationService } from "@src/crypto"

@Injectable()
export class FacebookAuthStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(FacebookAuthStrategy.name)
    constructor(
        private readonly serializationService: SerializationService
    ) {
        super({
            clientID: envConfig().facebook.oauth.clientId,
            clientSecret: envConfig().facebook.oauth.clientSecret,
            callbackURL: envConfig().facebook.oauth.redirectUri,
            passReqToCallback: true
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async authenticate(req: Request, options: any) {
        let state = undefined
        if (!req.query.state) {
            state = this.serializationService.serializeToBase64<FacebookAuthState>({
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
        profile: FacebookProfile,
        done: (error: Error | null, user?: UserFacebookLike) => void,
    ) {
        const state = this.serializationService.deserializeFromBase64<FacebookAuthState>(req.query.state as string)
        const { id, displayName } = profile
        const user: UserFacebookLike = {
            id,
            username: displayName,
            picture: profile.profileUrl,
            network: state.network
        }
        done(null, user)
    }
}

interface FacebookAuthState {
    network: Network
}

interface FacebookProfile {
    id: string;
    username?: string;
    displayName: string;
    name: {
      familyName?: string;
      givenName?: string;
      middleName?: string;
    };
    gender?: string;
    profileUrl?: string;
    provider: string;
    _raw: string;
    _json: {
      name: string;
      id: string;
    };
  }