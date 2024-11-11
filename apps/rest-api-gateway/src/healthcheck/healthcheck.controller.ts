import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Logger,
    OnModuleInit,
} from "@nestjs/common"
import {
    DoHealthcheckResponse,
    healthcheckGrpcConstants,
} from "@apps/healthcheck-service"
import { ClientGrpc } from "@nestjs/microservices"
import { IHealthcheckService } from "./healthcheck.service"
import { lastValueFrom } from "rxjs"
import { ApiResponse, ApiTags } from "@nestjs/swagger"  

@ApiTags("Healthcheck")
@Controller("healthcheck")
export class HealthcheckController implements OnModuleInit {
    private readonly logger = new Logger(HealthcheckController.name)

    constructor(
    @Inject(healthcheckGrpcConstants.NAME) private client: ClientGrpc,
    ) {}

    private healthcheckService: IHealthcheckService
    onModuleInit() {
        this.healthcheckService = this.client.getService<IHealthcheckService>(
            healthcheckGrpcConstants.SERVICE,
        )
    }

  @HttpCode(HttpStatus.OK)
  @ApiResponse({ type: DoHealthcheckResponse })
  @Get()
    public async doHealthcheck(): Promise<DoHealthcheckResponse
    > {
        try {
            return await lastValueFrom(this.healthcheckService.doHealthcheck({}));
        } catch (error) {
            this.logger.error("Healthcheck failed", error)
            throw new Error("Healthcheck service unavailable")
        }
    }
}
