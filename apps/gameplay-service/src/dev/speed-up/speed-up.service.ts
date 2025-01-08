import { Injectable, Logger } from "@nestjs/common"
import { Collection, CollectionEntity, InjectPostgreSQL, SpeedUpData } from "@src/databases"
import { SpeedUpTransactionFailedException } from "@src/exceptions"
import { DataSource } from "typeorm"
import { SpeedUpRequest, SpeedUpResponse } from "./speed-up.dto"

@Injectable()
export class SpeedUpService {
    private readonly logger = new Logger(SpeedUpService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) {}

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
                    },
                    {
                        collection: Collection.EnergySpeedUp,
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
