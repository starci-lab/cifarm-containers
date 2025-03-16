import { Injectable, Logger } from "@nestjs/common"
import { Connection } from "mongoose"
import { InjectMongoose, ProductId, ProductSchema } from "@src/databases"
import { createObjectId } from "@src/common"

@Injectable()
export class ProductService {
    private readonly logger = new Logger(ProductService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) { }

    async getProduct(id: ProductId): Promise<ProductSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<ProductSchema>(ProductSchema.name).findById(createObjectId(id))
        } finally {
            await mongoSession.endSession()
        }
    }

    async getProducts(): Promise<Array<ProductSchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<ProductSchema>(ProductSchema.name).find()
        } finally {
            await mongoSession.endSession()
        }
    }
}
