import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, ToolSchema } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class ToolsService {
    private readonly logger = new Logger(ToolsService.name)

    constructor(
       @InjectMongoose()
        private readonly connection: Connection
    ) { }

    async getTool(id: string): Promise<ToolSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<ToolSchema>(ToolSchema.name).findById(id)
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

    async getToolByKey(key: string): Promise<ToolSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<ToolSchema>(ToolSchema.name).findOne({ key })
        } finally {
            await mongoSession.endSession()
        }
    }
}
