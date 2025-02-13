import { Injectable, Logger } from "@nestjs/common"
import { GetDeliveringProductsArgs, GetDeliveringProductsResponse } from "./delivering-products.dto"
import { UserLike } from "@src/jwt"
import { DeliveringProductSchema, InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class DeliveringProductsService {
    private readonly logger = new Logger(DeliveringProductsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) { }

    async getDeliveringProduct(id: string): Promise<DeliveringProductSchema | null> {
        const mongoSession = await this.connection.startSession()
        try {
            return this.connection.model<DeliveringProductSchema>(DeliveringProductSchema.name).findById(id)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getDeliveringProducts(
        { id }: UserLike,
        { limit = 10, offset = 0 }: GetDeliveringProductsArgs
    ): Promise<GetDeliveringProductsResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            const data = await this.connection.model<DeliveringProductSchema>(DeliveringProductSchema.name)
                .find({ user: id })
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)

            const count = await this.connection.model<DeliveringProductSchema>(DeliveringProductSchema.name)
                .countDocuments({
                    user: id
                })

            return {
                data,
                count
            }
        } finally {
            await mongoSession.endSession()
        }  
    }
}
