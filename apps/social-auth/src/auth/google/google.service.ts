import { Injectable, Logger } from "@nestjs/common"
import { UserGoogleLike } from "@src/google-cloud"
import { UserSchema } from "@src/databases/mongoose/gameplay/schemas/user.schema"
import { OauthProviderName } from "@src/databases/mongoose/gameplay/enums/types"
import { Connection } from "mongoose"
import { EnergyService, StaticService, UsernameService } from "@src/gameplay"
import { envConfig } from "@src/env"
import { InjectMongoose } from "@src/databases"
import { SetupService } from "../../setup"
import { DeepPartial } from "@src/common"
@Injectable()
export class GoogleService {
    private readonly logger = new Logger(GoogleService.name)
    constructor(
        private readonly setupService: SetupService,
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly usernameService: UsernameService,
        private readonly energyService: EnergyService,
        private readonly staticService: StaticService
    ) {}

    async googleCallback(_user: UserGoogleLike): Promise<string> {
        const mongoSession = await this.connection.startSession()
        try {
            const result = await mongoSession.withTransaction(async (session) => {
                // create account if not exists
                let user = await this.connection.model<UserSchema>(UserSchema.name).findOne({
                    oauthProviderId: _user.id,
                    network: _user.network,
                    oauthProvider: OauthProviderName.Google,
                }).session(session)
                let create = false
                if (!user) {
                    create = true
                    const energy = this.energyService.getMaxEnergy()

                    const { golds } =
                        this.staticService.defaultInfo

                    // if referralUserId is provided, add credits
                    let amountChange: DeepPartial<UserSchema> = {}
                    if (_user.referralUserId) {
                        amountChange = {
                            tCIFARM: this.staticService.referral.amountPerSuccessfulReferral,
                            referralUserId: _user.referralUserId
                        }
                        // the referral user should also get credits
                        const referralUser = await this.connection.model<UserSchema>(UserSchema.name).findOne({
                            id: _user.referralUserId,
                            network: _user.network,
                        })
                        // check if the referral user exists
                        if (referralUser) {
                            referralUser.tCIFARM += this.staticService.referral.amountWhenYourReferralInviteSomeone
                            await referralUser.save({ session })

                            // check if the referral user has a referral user
                            if (referralUser.referralUserId) {
                                // also the referal user of the referral user should get credits
                                const referralUserReferralUser = await this.connection.model<UserSchema>(UserSchema.name).findOne({
                                    oauthProviderId: referralUser.referralUserId,
                                    network: _user.network,
                                })
                                if (referralUserReferralUser) {
                                    referralUserReferralUser.tCIFARM += this.staticService.referral.amountWhenYourReferralInviteSomeone
                                    await referralUserReferralUser.save({ session })
                                }
                            }
                        }
                    }

                    const [userRaw] = await this.connection
                        .model<UserSchema>(UserSchema.name)
                        .create(
                            [
                                {
                                    email: _user.email,
                                    oauthProviderId: _user.id,
                                    oauthProvider: OauthProviderName.Google,
                                    username: await this.usernameService.sanitizeUsername({ 
                                        usernameRaw: _user.username,
                                        network: _user.network
                                    }),
                                    avatarUrl: _user.picture,
                                    golds,
                                    network: _user.network,
                                    energy,
                                    ...amountChange
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

