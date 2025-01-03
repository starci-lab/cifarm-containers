import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import { Activities, SystemEntity, SystemId } from "@src/databases"

@Injectable()
export class SystemsService {
    private readonly logger = new Logger(SystemsService.name)

    constructor(private readonly dataSource: DataSource) {}

    async getActivities(): Promise<Activities> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const { value : activities } = await queryRunner.manager.findOne(SystemEntity, {
                where: {
                    id: SystemId.Activities
                }
            })
            return activities as Activities
        } finally {
            await queryRunner.release()
        }
    }
}
