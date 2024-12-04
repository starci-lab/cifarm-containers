import { Injectable, Logger } from "@nestjs/common"
import { VisitRequest } from "./visit.dto"
import { DataSource } from "typeorm"
import { UserEntity } from "@src/database"
import { SelfVisitException, UserNotFoundException } from "@src/exceptions"

@Injectable()
export class VisitService {
    private readonly logger = new Logger(VisitService.name)

    constructor(private readonly dataSource: DataSource) {}

    async visit(request: VisitRequest) {
        this.logger.debug(`Visit user ${request.visitingUserId} for user ${request.userId}`)

        if (
            request.userId.localeCompare(request.visitingUserId, undefined, {
                sensitivity: "base"
            }) === 0
        ) {
            throw new SelfVisitException(request.visitingUserId)
        }

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const userExists = await queryRunner.manager.exists(UserEntity, {
                where: { id: request.visitingUserId }
            })
            if (!userExists) {
                throw new UserNotFoundException(request.visitingUserId)
            }
            await queryRunner.manager.update(UserEntity, request.userId, {
                visitingUserId: request.visitingUserId,
                isRandom: request.isRandom
            })
        } finally {
            await queryRunner.release()
        }
    }
}
