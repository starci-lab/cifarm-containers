import { Injectable, Logger } from "@nestjs/common"
import {
    ValidateGoogleTokenRequest,
    ValidateGoogleTokenResponse
} from "./validate-google-token.dto"
import { FirebaseAdminService } from "@src/firebase-admin"
import { InjectMongoose, OauthProviderName, UserSchema } from "@src/databases"
import { Connection } from "mongoose"
import { JwtService } from "@src/jwt"
import { Network } from "@src/env"

@Injectable()
export class ValidateGoogleTokenService {
    private readonly logger = new Logger(ValidateGoogleTokenService.name)

    constructor(
        private readonly firebaseAdminService: FirebaseAdminService,
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly jwtService: JwtService
    ) {}

    public async validateGoogleToken({
        token, network = Network.Testnet
    }: ValidateGoogleTokenRequest): Promise<ValidateGoogleTokenResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            const result = await mongoSession.withTransaction(async (session) => {
                const decodedToken = await this.firebaseAdminService.validateToken(token)
                // get user info from google
                const userInfo = await this.firebaseAdminService.getUser(decodedToken.uid)
                // create account if not exists
                let user = await this.connection.model<UserSchema>(UserSchema.name).findOne({
                    email: decodedToken.email,
                    oauthProvider: OauthProviderName.Google
                })
                if (!user) {
                    const [rawUser] = await this.connection.model<UserSchema>(UserSchema.name).create(
                        [
                            {
                                email: decodedToken.email,
                                oauthProvider: OauthProviderName.Google,
                                username: userInfo.displayName,
                                avatarUrl: userInfo.photoURL,
                                network
                            }
                        ],
                        { session }
                    )
                    user = rawUser
                    user.id = rawUser._id
                }
                // create access token
                const { accessToken, refreshToken } = await this.jwtService.generateAuthCredentials({
                    id: user.id
                })
                return {
                    message: "Token validated successfully",
                    success: true,
                    data: {
                        accessToken,
                        refreshToken: refreshToken.token
                    }
                }
            })
            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
