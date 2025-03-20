import { Injectable } from "@nestjs/common"
import { InjectMongoose, InventorySchema, UserSchema } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class UserService {
    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async getUser(userId: string) {
        const mongoSession = await this.connection.startSession()   
        try {
            return await this.connection.model<UserSchema>(UserSchema.name).findById(userId)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getInventories(userId: string) {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<InventorySchema>(InventorySchema.name).find({ user: userId })
        } finally {
            await mongoSession.endSession()
        }
    }   
}
    