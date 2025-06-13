import { CommandRunner, SubCommand } from "nest-commander"
import { Logger } from "@nestjs/common"
import { InjectMongoose, UserSchema } from "@src/databases"
import { Connection } from "mongoose"
import { UsernameService } from "@src/gameplay"

@SubCommand({ 
    name: "sanitize-usernames",
    description: "Sanitize usernames by removing diacritics and spaces",
    aliases: [ "su" ]
})
export class SanitizeUsernamesCommand extends CommandRunner {
    private readonly logger = new Logger(SanitizeUsernamesCommand.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly usernameService: UsernameService
    ) {
        super()
    }

    async run(): Promise<void> {
        try {
        // we use loop to sanitize usernames
        // get all user count
            const userCount = await this.connection.model<UserSchema>(UserSchema.name).countDocuments().lean().exec()
            this.logger.verbose(`Total users: ${userCount}`)
            // get all users
            // slip into 1000 users per batch
            const batchSize = 1000
            const totalBatches = Math.ceil(userCount / batchSize)
            this.logger.verbose(`Total batches: ${totalBatches}`)
            for (let i = 0; i < totalBatches; i++) {
                const users = await this.connection.model<UserSchema>(UserSchema.name)
                    .find()
                    .skip(i * batchSize)
                    .limit(batchSize)
                // check if username is sanitized
                for (const user of users) {
                    if (!this.usernameService.isUsernameSanitized({ username: user.username })) {
                        this.logger.verbose(`${user.username} is not sanitized`)
                        // sanitize username
                        const sanitizedUsername = await this.usernameService.sanitizeUsername({ usernameRaw: user.username, network: user.network })
                        this.logger.verbose(`Sanitized username: ${sanitizedUsername}`)
                        // update username
                        user.username = sanitizedUsername
                        await user.save()
                    }
                }
                this.logger.verbose(`Batch ${i + 1} of ${totalBatches} completed`)
            }
            this.logger.log("Sanitize usernames command completed")
        } catch (error) {
            this.logger.error(error)
        }
    }
}
