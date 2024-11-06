import {
    Controller,
    HttpCode,
    HttpStatus,
    Inject,
    Logger,
    OnModuleInit,
    Post,
    UseGuards,
} from "@nestjs/common"
import {
    DoHealthcheckResponse,
    healthcheckGrpcConstants,
} from "@apps/healthcheck-service"

import { ClientGrpc } from "@nestjs/microservices"
import { lastValueFrom } from "rxjs"
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger"  
import { IHealthcheckService } from "../healthcheck"
import { User } from "@src/decorators"
import { UserLike } from "@src/services"
import { RestJwtAuthGuard } from "@src/guards"

@ApiTags("Gameplay")
@Controller("gameplay")
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
   
  @ApiBearerAuth()
  @UseGuards(RestJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ type: DoHealthcheckResponse })
  @Post("/buy-seeds") 
    public async buySeeds(@User() user: UserLike): Promise<DoHealthcheckResponse
    > { 
        console.log("User", user)
        return await lastValueFrom(this.healthcheckService.doHealthcheck({}))
    }
}
