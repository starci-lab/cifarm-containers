import { Injectable, Logger } from "@nestjs/common"
import { UserSchema, OauthProviderName } from "@src/databases"
import { Connection } from "mongoose"
import { EnergyService, StaticService } from "@src/gameplay"
import { envConfig } from "@src/env"
import { InjectMongoose } from "@src/databases"
import { UserFacebookLike } from "@src/facebook"
import { SetupService } from "../../setup"
@Injectable()
export class FacebookService {
    private readonly logger = new Logger(FacebookService.name)
    constructor(
        private readonly setupService: SetupService,
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly staticService: StaticService
    ) {}

    async facebookCallback(_user: UserFacebookLike): Promise<string> {
        const mongoSession = await this.connection.startSession()
        try {
            const result = await mongoSession.withTransaction(async (session) => {
                // create account if not exists
                let user = await this.connection.model<UserSchema>(UserSchema.name).findOne({
                    oauthProviderId: _user.id,
                    network: _user.network,
                    oauthProvider: OauthProviderName.Facebook
                })  
                let create = false
                if (!user) {
                    create = true
                    const energy = this.energyService.getMaxEnergy()

                    const { golds } =
                        this.staticService.defaultInfo

                    const [userRaw] = await this.connection
                        .model<UserSchema>(UserSchema.name)
                        .create(
                            [
                                {
                                    oauthProviderId: _user.id,
                                    oauthProvider: OauthProviderName.Facebook,
                                    username: _user.username,
                                    avatarUrl: _user.picture,
                                    golds,
                                    network: _user.network,
                                    energy
                                }
                            ],
                            { session }
                        )
                    user = userRaw
                    user.id = userRaw._id
                }
                const { accessToken, refreshToken } = await this.setupService.setup({
                    user,
                    session,
                    create
                })

                // return the redirect url
                return `${envConfig().webApps[_user.network].url}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
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

