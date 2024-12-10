import { Injectable, Logger } from "@nestjs/common"
import {
    MoveTransactionFailedException
} from "@src/exceptions"
import { DataSource } from "typeorm"
import { MoveRequest, MoveResponse } from "./move.dto"

@Injectable()
export class MoveService {
    private readonly logger = new Logger(MoveService.name)

    constructor(
        private readonly dataSource: DataSource
    ) {}

    async move(request: MoveRequest): Promise<MoveResponse> {
        this.logger.debug(
            `Calling Move with placedItemTileId: ${request.placedItemTileId} with position: x: ${request.position.x}, y: ${request.position.y}`
        )
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            try {
                // Get user

                //Save inventory
                await queryRunner.commitTransaction()

                return
            } catch (error) {
                await queryRunner.rollbackTransaction()
                throw new MoveTransactionFailedException(error)
            }
        } finally {
            await queryRunner.release()
        }
    }
}
