import { Injectable, Logger } from "@nestjs/common"
import { SupplyEntity } from "@src/databases"
import { DataSource } from "typeorm"
import { GetSuppliesArgs } from "./"

@Injectable()
export class SuppliesService {
    private readonly logger = new Logger(SuppliesService.name)

    private readonly relations = {
        inventoryType: true,
    }

    constructor(private readonly dataSource: DataSource) {}

    async getSupplies({ limit = 10, offset = 0 }: GetSuppliesArgs): Promise<Array<SupplyEntity>> {
        this.logger.debug(`GetSupplies: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const supplies = await queryRunner.manager.find(SupplyEntity, {
                take: limit,
                skip: offset,
                relations: this.relations
            })
            return supplies
        } finally {
            await queryRunner.release()
        }
    }

    async getSupplyById(id: string): Promise<SupplyEntity | null> {
        this.logger.debug(`GetSupplyById: id=${id}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const supply = await queryRunner.manager.findOne(SupplyEntity, {
                where: { id },
                relations: this.relations
            })
            return supply
        } finally {
            await queryRunner.release()
        }
    }
}
