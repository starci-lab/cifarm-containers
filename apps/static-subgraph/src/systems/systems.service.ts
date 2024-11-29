import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import { GetSystemsArgs } from "./systems.dto"
import { SystemEntity } from "@src/database"

@Injectable()
export class SystemsService {
    private readonly logger = new Logger(SystemsService.name)

    constructor(
        private readonly dataSource: DataSource,
    ) { }

    async getSystems({ limit = 10, offset = 0 }: GetSystemsArgs): Promise<Array<SystemEntity>> {
        this.logger.debug(`GetSystems: limit=${limit}, offset=${offset}`)

        let systems: Array<SystemEntity>
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            systems = await this.dataSource.getRepository(SystemEntity).find({
                take: limit,
                skip: offset
            })
        } finally {
            await queryRunner.release()
        }
        return systems
    }
}
