import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import {
    PlacedItemEntity,
    PlacedItemTypeId,
    Starter,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/database"
import {
    AfterAuthenticatedFirstTimeTransactionFailedException,
} from "@src/exceptions"
import { EnergyService } from "@src/services"
import { DataSource, DeepPartial } from "typeorm"
import { AfterAuthenticatedRequest, AfterAuthenticatedResponse } from "./after-authenticated.dto"

@Injectable()
export class AfterAuthenticatedService {
    private readonly logger = new Logger(AfterAuthenticatedService.name)
    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private readonly energyService: EnergyService
    ) {}

    async afterAuthenticated(
        request: AfterAuthenticatedRequest
    ): Promise<AfterAuthenticatedResponse> {
        this.logger.debug(`After authenticated for user ${request.userId}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const user = await queryRunner.manager.findOne(UserEntity, {
                where: {
                    id: request.userId,
                    hasCompletedFirstAuth: false
                }
            })

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Starter }
            })
            const { golds, positions } = value as Starter

            if (!user) {
                try{
                    // first auth already completed
                    //charge full energy
                    const energy = this.energyService.getMaxEnergy()
                    await queryRunner.startTransaction()
                    await queryRunner.manager.update(UserEntity, user.id, {
                        hasCompletedFirstAuth: true,
                        golds,
                        energy
                    })

                    const home: DeepPartial<PlacedItemEntity> = {
                        placedItemTypeId: PlacedItemTypeId.Home,
                        ...positions.home
                    }
                    const tiles: Array<DeepPartial<PlacedItemEntity>> = positions.tiles.map(
                        (tile) => ({
                            placedItemTypeId: PlacedItemTypeId.StarterTile,
                            ...tile
                        })
                    )
                    //create home & tiles
                    await queryRunner.manager.save(PlacedItemEntity, [home, ...tiles])
                    await queryRunner.commitTransaction()
                } catch (error) {
                    this.logger.error("Transaction after authenticated first time failed", error.message)
                    await queryRunner.rollbackTransaction()
                    throw new AfterAuthenticatedFirstTimeTransactionFailedException(error.message)
                }
            } else {
                // first auth not yet completed
                //apply logic later
            }
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}
