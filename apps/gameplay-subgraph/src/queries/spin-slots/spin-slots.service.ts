import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, SpinSlotSchema } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class SpinSlotsService {
    private readonly logger = new Logger(SpinSlotsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
    ) {}

    async getSpinSlots(): Promise<Array<SpinSlotSchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model(SpinSlotSchema.name).find()
        } finally {
            await mongoSession.endSession()
        }
    }

    async getSpinSlot(id: string): Promise<SpinSlotSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model(SpinSlotSchema.name).findById(id)
        } finally {
            await mongoSession.endSession()
        }
    }
}
