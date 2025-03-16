import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import { InjectMongoose, ToolId, ToolSchema } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class ToolsService {
    private readonly logger = new Logger(ToolsService.name)

    constructor(
       @InjectMongoose()
        private readonly connection: Connection
    ) { }

    async getTool(id: ToolId): Promise<ToolSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<ToolSchema>(ToolSchema.name).findById(createObjectId(id))
        } finally {
            await mongoSession.endSession()
        }
    }

    async getTools(): Promise<Array<ToolSchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<ToolSchema>(ToolSchema.name).find()
        } finally {
            await mongoSession.endSession()
        }
    }
}
