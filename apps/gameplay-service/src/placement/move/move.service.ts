import { Injectable, Logger } from "@nestjs/common"
import { InjectPostgreSQL, PlacedItemEntity } from "@src/databases"
import { DataSource } from "typeorm"
import { MoveRequest } from "./move.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"

@Injectable()
export class MoveService {
    private readonly logger = new Logger(MoveService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) {}

    async move(request: MoveRequest) {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const placedItem = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id: request.placedItemId, userId: request.userId }
            })

            if (!placedItem) throw new GrpcNotFoundException("Placed item not found")

            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.update(PlacedItemEntity, request.placedItemId, {
                    x: request.position.x,
                    y: request.position.y
                })
                await queryRunner.commitTransaction()
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }
        } finally {
            await queryRunner.release()
        }
    }
}
