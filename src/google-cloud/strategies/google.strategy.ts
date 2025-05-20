import { envConfig, Network } from "@src/env"
import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20"
import { UserGoogleLike } from "../types"
import { SerializationService } from "@src/crypto"
import { Request } from "express"

interface GoogleAuthState {
    network: Network
    referralUserId?: string
}

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly serializationService: SerializationService
    ) {
        super({
            // google console auth
            clientID: envConfig().googleCloud.oauth.clientId,
            clientSecret: envConfig().googleCloud.oauth.clientSecret,
            callbackURL: envConfig().googleCloud.oauth.redirectUri,
            scope: ["email", "profile"],
            passReqToCallback: true
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async authenticate(req: Request, options: any) {
        let state = undefined
        if (!req.query.state) {
            state = this.serializationService.serializeToBase64<GoogleAuthState>({
                network: req.query.network as Network || Network.Testnet,
                referralUserId: req.query.referralUserId as string
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
        profile: Profile,
        done: VerifyCallback,
    ) {
        const state = this.serializationService.deserializeFromBase64<GoogleAuthState>(req.query.state as string)
        const { emails, photos, id, displayName } = profile
        const user: UserGoogleLike = {
            id,
            email: emails[0].value,
            username: displayName,
            picture: photos[0].value,
            network: state.network,
            referralUserId: state.referralUserId
        }
        done(null, user)
    }
}