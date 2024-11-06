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
import { TransformedSuccessResponse } from "../transform"

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
  @ApiResponse({ type: TransformedSuccessResponse<DoHealthcheckResponse> })
  @Get()
    public async doHealthcheck(): Promise<
    TransformedSuccessResponse<DoHealthcheckResponse>
    > {
        const data = await lastValueFrom(this.healthcheckService.doHealthcheck({}))
        return {
            data,
            status: HttpStatus.OK,
            message: "Success",
        }
    }
}
