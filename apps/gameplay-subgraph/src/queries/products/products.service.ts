import { Injectable, Logger } from "@nestjs/common"
import { ProductId, ProductSchema } from "@src/databases"
import { StaticService } from "@src/gameplay"

@Injectable()
export class ProductService {
    private readonly logger = new Logger(ProductService.name)

    constructor(
        private readonly staticService: StaticService
    ) { }

    products(): Array<ProductSchema> {
        return this.staticService.products
    }

    product(id: ProductId): ProductSchema {
        return this.staticService.products.find((product) => product.displayId === id)
    }
}
