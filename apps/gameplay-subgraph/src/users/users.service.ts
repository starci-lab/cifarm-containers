import { Injectable, Logger } from "@nestjs/common"
import { InjectConnection } from "@nestjs/mongoose"
import { UserSchema } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name)

    constructor(
        @InjectConnection()
        private readonly connection: Connection
    ) {}

    async getUser(id: string): Promise<UserSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<UserSchema>(UserSchema.name).findById(id)
        } finally {
            await mongoSession.endSession()
        }
    }
}
