import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, SupplySchema } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class SuppliesService {
    private readonly logger = new Logger(SuppliesService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async getSupply(id: string): Promise<SupplySchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<SupplySchema>(SupplySchema.name).findById(id)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getSupplies(): Promise<Array<SupplySchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<SupplySchema>(SupplySchema.name).find()
        } finally {
            await mongoSession.endSession()
        }
    }

    async getSupplyByKey(key: string): Promise<SupplySchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<SupplySchema>(SupplySchema.name).findOne({ key })
        } finally {
            await mongoSession.endSession()
        }
    }
}
