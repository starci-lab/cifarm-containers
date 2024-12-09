import { Injectable, Logger } from "@nestjs/common"
import { UserEntity } from "@src/database"
import { DataSource, ILike } from "typeorm"
import { GetUsersArgs } from "@apps/static-subgraph/src/users/users.dto"

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name)

    constructor(private readonly dataSource: DataSource) {}

    async getUsers(args: GetUsersArgs): Promise<Array<UserEntity>> {
        this.logger.debug(`GetUsers: ${JSON.stringify(args)}`)

        const { offset, limit, ...whereParams } = args

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const users = await this.dataSource.getRepository(UserEntity).find({
                where: {
                    ...whereParams,
                    username: args.username || "" ? ILike(`%${args.username}%`) : args.username
                },
                take: limit,
                skip: offset,
                relations: ["inventories", "placedItems"]
            })
            return users
        } finally {
            await queryRunner.release()
        }
    }

    async getRandomUser(excludeUserId: string): Promise<UserEntity | null> {
        this.logger.debug(`Random user for user ${excludeUserId}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            return await this.dataSource
                .createQueryBuilder(UserEntity, "user", queryRunner)
                .where("id NOT IN (:id, '00000000-0000-0000-0000-000000000000')", {
                    id: excludeUserId
                })
                .orderBy("RANDOM()")
                .getOne()
        } finally {
            await queryRunner.release()
        }
    }
}
