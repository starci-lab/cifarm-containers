import { Injectable, Logger } from "@nestjs/common"
import { Connection } from "mongoose"
import { InjectMongoose, ProductSchema } from "@src/databases"

@Injectable()
export class ProductService {
    private readonly logger = new Logger(ProductService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) { }

    async getProduct(id: string): Promise<ProductSchema> {
        return this.connection.model<ProductSchema>(ProductSchema.name).findById(id)
    }

    async getProducts(): Promise<Array<ProductSchema>> {
        return this.connection.model<ProductSchema>(ProductSchema.name).find()
    }

    async getProductByKey(key: string): Promise<ProductSchema> {
        return this.connection.model<ProductSchema>(ProductSchema.name).findOne({ key })
    }
}
