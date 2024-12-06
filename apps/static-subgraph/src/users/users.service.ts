import { Injectable, Logger } from "@nestjs/common"
import { UserEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetUsersArgs } from "@apps/static-subgraph/src/users/users.dto"

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name)

    constructor(private readonly dataSource: DataSource) {}

    async getUsers({ limit = 10, offset = 0 }: GetUsersArgs): Promise<Array<UserEntity>> {
        this.logger.debug(`GetUsers: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const users = await this.dataSource.getRepository(UserEntity).find({
                take: limit,
                skip: offset,
                relations: ["inventories", "placedItems"]
            })
            return users
        } finally {
            await queryRunner.release()
        }
    }
}
