import { Injectable, Logger } from "@nestjs/common"
import { DoHealthcheckResponse } from "./do-healthcheck.dto"
import { DataSource } from "typeorm"
import { HealthcheckEntity } from "@src/database"

@Injectable()
export class DoHealthcheckService {
    private readonly logger = new Logger(DoHealthcheckService.name)

    constructor(private readonly dataSource: DataSource) {}

    public async doHealthcheck(): Promise<DoHealthcheckResponse> {
        await this.dataSource.manager.save(HealthcheckEntity, {})
        return {
            message: "ok"
        }
    }
}
