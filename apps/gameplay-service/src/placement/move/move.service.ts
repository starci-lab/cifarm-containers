import { Injectable, Logger } from "@nestjs/common"
import { InjectPostgreSQL, PlacedItemEntity, UserEntity } from "@src/databases"
import { DataSource } from "typeorm"
import { MoveRequest } from "./move.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class MoveService {
    private readonly logger = new Logger(MoveService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
    ) {
    }

    async move(request:MoveRequest) {
        this.logger.debug(`Received request to move placement: ${JSON.stringify(request)}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            const placedItem = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id: request.placedItemId }
            })

            if (!placedItem) throw new GrpcNotFoundException("Placed item not found")

            if(placedItem.userId !== user.id) throw new GrpcFailedPreconditionException("Placed item not belong to user")
            
            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.update(PlacedItemEntity, request.placedItemId, {
                    x: request.position.x,
                    y: request.position.y
                })
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }     
        }
        finally {
            await queryRunner.release()
        }
    }
}
