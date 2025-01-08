import { Injectable, Logger } from "@nestjs/common"
import { InjectPostgreSQL, SupplyEntity } from "@src/databases"
import { DataSource } from "typeorm"
import { GetSuppliesArgs, GetSupplyArgs } from "./supplies.dto"

@Injectable()
export class SuppliesService {
    private readonly logger = new Logger(SuppliesService.name)
 
    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) { }
    
    async getSupply({ id }: GetSupplyArgs): Promise<SupplyEntity | null> {
        this.logger.debug(`GetSupplyById: id=${id}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const supply = await queryRunner.manager.findOne(SupplyEntity, {
                where: { id },
            })
            return supply
        } finally {
            await queryRunner.release()
        }
    }

    async getSupplies({ limit = 10, offset = 0 }: GetSuppliesArgs): Promise<Array<SupplyEntity>> {
        this.logger.debug(`GetSupplies: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const supplies = await queryRunner.manager.find(SupplyEntity, {
                take: limit,
                skip: offset,
            })
            return supplies
        } finally {
            await queryRunner.release()
        }
    }
}
