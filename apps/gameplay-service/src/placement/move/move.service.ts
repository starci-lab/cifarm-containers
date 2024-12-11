import { Injectable, Logger } from "@nestjs/common"
import { PlacedItemEntity, UserEntity } from "@src/database"
import { PlacedItemNotFoundException, UserIsNotOwnerPlacedItemException } from "@src/exceptions"
import { DataSource } from "typeorm"
import { MoveRequest } from "./move.dto"

@Injectable()
export class MoveService {
    private readonly logger = new Logger(MoveService.name)

    constructor(private readonly dataSource: DataSource) {}

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

            if (!placedItem) throw new PlacedItemNotFoundException(request.placedItemId)

            if(placedItem.userId !== user.id) throw new UserIsNotOwnerPlacedItemException(request.userId, request.placedItemId)
            
            await queryRunner.manager.update(PlacedItemEntity, request.placedItemId, {
                x: request.position.x,
                y: request.position.y
            })
        }
        finally {
            await queryRunner.release()
        }
    }
}
