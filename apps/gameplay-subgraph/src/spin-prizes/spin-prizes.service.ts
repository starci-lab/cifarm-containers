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

    async getSpinPrizes(): Promise<Array<SpinPrizeSchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model(SpinPrizeSchema.name).find()
        } finally {
            await mongoSession.endSession()
        }
    }

    async getSpinPrize(id: string): Promise<SpinPrizeSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model(SpinPrizeSchema.name).findById(id)
        } finally {
            await mongoSession.endSession()
        }
    }
}
