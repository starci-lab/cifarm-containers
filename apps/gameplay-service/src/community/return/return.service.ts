import { Injectable, Logger } from "@nestjs/common"
import { InjectPostgreSQL, UserEntity } from "@src/databases"
import { DataSource } from "typeorm"
import { ReturnRequest } from "./return.dto"

@Injectable()
export class ReturnService {
    private readonly logger = new Logger(ReturnRequest.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) {}

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
