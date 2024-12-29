import { Injectable, Logger } from "@nestjs/common"
import { ReturnRequest } from "./return.dto"
import { DataSource } from "typeorm"
import { GameplayPostgreSQLService, UserEntity } from "@src/databases"

@Injectable()
export class ReturnService {
    private readonly logger = new Logger(ReturnRequest.name)

    private readonly dataSource: DataSource
    constructor(
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }

    async return(request: ReturnRequest) {
        this.logger.debug(`Return for user ${request.userId}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            await queryRunner.manager.update(UserEntity, request.userId, {
                visitingUserId: null,
                isRandom: null
            })
        } finally {
            await queryRunner.release()
        }
    }
}
