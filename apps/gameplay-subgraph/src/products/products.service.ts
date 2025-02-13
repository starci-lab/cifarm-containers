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
        return this.connection.model<ProductSchema>(ProductSchema.name).findById(createObjectId(id))
    }

    async getProducts(): Promise<Array<ProductSchema>> {
        return this.connection.model<ProductSchema>(ProductSchema.name).find()
    }
}
