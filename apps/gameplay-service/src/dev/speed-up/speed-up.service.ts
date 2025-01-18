import { Injectable, Logger } from "@nestjs/common"
import { Collection, CollectionEntity, InjectPostgreSQL, SpeedUpData } from "@src/databases"
import { DataSource } from "typeorm"
import { SpeedUpRequest, SpeedUpResponse } from "./speed-up.dto"
import { GrpcInternalException } from "nestjs-grpc-exceptions"

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
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}
