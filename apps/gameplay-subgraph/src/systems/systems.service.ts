import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import { GetSystemsArgs } from "./"
import { SystemEntity } from "@src/database"

@Injectable()
export class SystemsService {
    private readonly logger = new Logger(SystemsService.name)

    private readonly relations = {
        // Add relations here as needed, e.g., related entities
    }

    constructor(private readonly dataSource: DataSource) {}

    async getSystems({ limit = 10, offset = 0 }: GetSystemsArgs): Promise<Array<SystemEntity>> {
        this.logger.debug(`GetSystems: limit=${limit}, offset=${offset}`)

        let systems: Array<SystemEntity>
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            systems = await queryRunner.manager.find(SystemEntity, {
                take: limit,
                skip: offset,
                relations: this.relations
            })
        } finally {
            await queryRunner.release()
        }
        return systems
    }

    async getSystemById(id: string): Promise<SystemEntity | null> {
        this.logger.debug(`GetSystemById: id=${id}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const system = await queryRunner.manager.findOne(SystemEntity, {
                where: { id },
                relations: this.relations
            })
            return system
        } finally {
            await queryRunner.release()
        }
    }
}
