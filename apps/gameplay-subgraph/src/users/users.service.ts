import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import { GetUsersArgs } from "./"
import { UserEntity } from "@src/databases/gameplay-postgresql/entities"
import { GameplayPostgreSQLService } from "@src/databases"

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name)

    private readonly relations = {
        inventories: true,
        placedItems: true,
    }

    private readonly dataSource: DataSource
        
    constructor(
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService,
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }

    async getUsers({ limit = 10, offset = 0 }: GetUsersArgs): Promise<Array<UserEntity>> {
        this.logger.debug(`GetUsers: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const users = await queryRunner.manager.find(UserEntity, {
                take: limit,
                skip: offset,
                relations: this.relations
            })
            return users
        } finally {
            await queryRunner.release()
        }
    }

    async getUserById(id: string): Promise<UserEntity | null> {
        this.logger.debug(`GetUserById: id=${id}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id },
                relations: this.relations
            })
            return user
        } finally {
            await queryRunner.release()
        }
    }
}
