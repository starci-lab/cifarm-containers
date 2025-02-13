import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, UserSchema } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async getUser(id: string): Promise<UserSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<UserSchema>(UserSchema.name).findById(id).session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }
}
