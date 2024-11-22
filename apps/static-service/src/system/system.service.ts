import { Injectable, Logger } from "@nestjs/common"
import { SystemEntity } from "@src/database"
import { DataSource } from "typeorm"
import {
    GetSystemRequest,
    GetSystemResponse
} from "./system.dto"

@Injectable()
export class SystemService {
    private readonly logger: Logger = new Logger(SystemService.name)

    constructor(private readonly dataSource: DataSource) {}

    public async getSystem(request: GetSystemRequest): Promise<GetSystemResponse> {
        return await this.dataSource.manager.findOne(SystemEntity, {
            where: { id: request.id }
        })
    }
}
