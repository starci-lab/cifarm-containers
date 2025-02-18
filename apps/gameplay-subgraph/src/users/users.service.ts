import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, UserSchema } from "@src/databases"
import { Connection } from "mongoose"
import { GetNeighborsArgs, GetNeighborsResponse } from "./users.dto"
import { UserLike } from "@src/jwt"

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

    async getNeighbors({ id }: UserLike, { limit, offset }: GetNeighborsArgs): Promise<GetNeighborsResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            const data = await this.connection.model<UserSchema>(UserSchema.name).find({
                _id: { $ne: id }
            }).session(mongoSession).skip(offset).limit(limit)

            const count = await this.connection.model<UserSchema>(UserSchema.name).countDocuments({
                _id: { $ne: id }
            }).session(mongoSession)

            return {
                data,
                count
            }
        } finally {
            await mongoSession.endSession()
        }
    }
}
