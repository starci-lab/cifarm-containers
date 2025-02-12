import { Injectable, Logger } from "@nestjs/common"
import { InjectPostgreSQL, UserSchema } from "@src/databases"
import { DataSource } from "typeorm"

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) {}

    //get single user, by id
    async getUser(id: string): Promise<UserSchema | null> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return queryRunner.manager.findOne(UserSchema, {
                where: {
                    id
                }
            })
        } finally {
            await queryRunner.release()
        }
    }
}
