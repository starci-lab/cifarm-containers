import { Injectable, Logger } from "@nestjs/common"
import { SpeedUpRequest, SpeedUpResponse } from "./speed-up.dto"
import { DataSource } from "typeorm"
import { SpeedUpTransactionFailedException } from "@src/exceptions"
import { Collection, CollectionEntity, GameplayPostgreSQLService, SpeedUpData } from "@src/databases"

@Injectable()
export class SpeedUpService {
    private readonly logger = new Logger(SpeedUpService.name)

    private readonly dataSource: DataSource
    constructor(
        private readonly gameplayPostgresqlService: GameplayPostgreSQLService
    ) {
        this.dataSource = this.gameplayPostgresqlService.getDataSource()
    }

    async speedUp(request: SpeedUpRequest): Promise<SpeedUpResponse> {
        this.logger.debug(`Speeding up growth time with time ${request.time}`)
        
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const data: SpeedUpData = {
                time: request.time
            }

            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.save(CollectionEntity, [
                    {
                        collection: Collection.CropSpeedUp,
                        data
                    },
                    {
                        collection: Collection.AnimalSpeedUp,
                        data
                    }
                ])
                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error(error)
                await queryRunner.rollbackTransaction()
                throw new SpeedUpTransactionFailedException(error)
            }
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}
