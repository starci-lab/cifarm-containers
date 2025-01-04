import { Injectable, Logger } from "@nestjs/common"
import { GameplayPostgreSQLService, ProductEntity } from "@src/databases"
import { DataSource, FindOptionsRelations } from "typeorm"
import { GetProductsArgs } from "./products.dto"

@Injectable()
export class ProductService {
    private readonly logger = new Logger(ProductService.name)

    private readonly relations:FindOptionsRelations<ProductEntity> = {
        crop: true,
        animal: true,
    }

    private readonly dataSource: DataSource
        
    constructor(
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService,
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }

    async getProducts({ limit = 10, offset = 0 }: GetProductsArgs): Promise<Array<ProductEntity>> {
        this.logger.debug(`GetProducts: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const products = await queryRunner.manager.find(ProductEntity, {
                take: limit,
                skip: offset,
                relations: this.relations
            })
            return products
        } finally {
            await queryRunner.release()
        }
    }

    async getProductById(id: string): Promise<ProductEntity | null> {
        this.logger.debug(`GetProductById: id=${id}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const product = await queryRunner.manager.findOne(ProductEntity, {
                where: { id },
                relations: this.relations
            })
            return product
        } finally {
            await queryRunner.release()
        }
    }
}
