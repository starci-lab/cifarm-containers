import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, SpinPrizeSchema } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class SpinPrizesService {
    private readonly logger = new Logger(SpinPrizesService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async spinPrizes(): Promise<Array<SpinPrizeSchema>> {
        return await this.connection.model(SpinPrizeSchema.name).find()
    }

    async spinPrize(id: string): Promise<SpinPrizeSchema> {
        return await this.connection.model(SpinPrizeSchema.name).findById(id)
    }
}
