import { GetProductsArgs } from "@apps/static-subgraph/src/products/products.dto"
import { Injectable, Logger } from "@nestjs/common"
import { ProductEntity } from "@src/database"
import { DataSource } from "typeorm"

@Injectable()
export class ProductService {
    private readonly logger = new Logger(ProductService.name)

    constructor(private readonly dataSource: DataSource) {}

    async getProducts({ limit = 10, offset = 0 }: GetProductsArgs): Promise<Array<ProductEntity>> {
        this.logger.debug(`GetProducts: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const products = await this.dataSource.getRepository(ProductEntity).find({
                take: limit,
                skip: offset,
                relations: ["crop", "animal"]
            })
            return products
        } finally {
            await queryRunner.release()
        }
    }
}
