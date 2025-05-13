import { Injectable } from "@nestjs/common"
import { envConfig } from "@src/env"
import { OAuth2Client } from "google-auth-library"

@Injectable()
export class GoogleOAuthService {
    private readonly oauthClient: OAuth2Client

    constructor() {
        this.oauthClient = new OAuth2Client(
            envConfig().googleCloudOAuth.clientId,
            envConfig().googleCloudOAuth.clientSecret
        )
    }

    public async verifyToken(token: string) {
        const payload = await this.oauthClient.getTokenInfo(token)
        return payload
    }
}

