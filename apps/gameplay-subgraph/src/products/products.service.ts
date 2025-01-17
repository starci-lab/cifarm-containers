import { Injectable, Logger } from "@nestjs/common"
import { CacheQueryRunnerService, InjectPostgreSQL, ProductEntity } from "@src/databases"
import { DataSource } from "typeorm"

@Injectable()
export class ProductService {
    private readonly logger = new Logger(ProductService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly cacheQueryRunnerService: CacheQueryRunnerService
    ) { }

    async getProduct(id: string): Promise<ProductEntity | null> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.findOne(queryRunner, ProductEntity, {
                where: {
                    id
                }
            })
        } finally {
            await queryRunner.release()
        }
    }

    async getProducts(): Promise<Array<ProductEntity>> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.find(queryRunner, ProductEntity)
        } finally {
            await queryRunner.release()
        }
    }
}
