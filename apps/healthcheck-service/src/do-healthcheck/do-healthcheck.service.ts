import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { DoHealthcheckResponse } from "./do-healthcheck.dto"
import { healthcheckGrpcConstants } from "../constant"
import { DataSource } from "typeorm"
import { HealthcheckEntity } from "@src/database"

@Controller()
export class DoHealthcheckService {
    private readonly logger = new Logger(DoHealthcheckService.name)

    constructor(
        private readonly dataSource: DataSource
    ) {}

  @GrpcMethod(healthcheckGrpcConstants.SERVICE, "DoHealthcheck")
    public async doHealthcheck(): Promise<DoHealthcheckResponse> {
        this.logger.debug("Healthcheck request received")
        await this.dataSource.manager.save(HealthcheckEntity, {})
        return {
            message: "ok",
        }
    }
}
