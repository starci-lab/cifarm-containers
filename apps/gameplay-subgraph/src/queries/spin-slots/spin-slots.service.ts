import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, SpinSlotSchema } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class SpinSlotsService {
    private readonly logger = new Logger(SpinSlotsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async spinSlots(): Promise<Array<SpinSlotSchema>> {
        return await this.connection.model(SpinSlotSchema.name).find()
    }

    async spinSlot(id: string): Promise<SpinSlotSchema> {
        return await this.connection.model(SpinSlotSchema.name).findById(id)
    }
}
