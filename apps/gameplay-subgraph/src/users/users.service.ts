import { Injectable, Logger } from "@nestjs/common"
import { InjectPostgreSQL, UserEntity } from "@src/databases"
import { DataSource } from "typeorm"

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) {}

    //get single user, by id
    async getUser(id: string): Promise<UserEntity | null> {
        this.logger.debug(`GetUser: id=${id}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return queryRunner.manager.findOne(UserEntity, {
                where: {
                    id
                }
            })
        } finally {
            await queryRunner.release()
        }
    }
}
