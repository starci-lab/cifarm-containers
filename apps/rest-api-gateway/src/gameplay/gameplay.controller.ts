import {
    healthcheckGrpcConstants
} from "@apps/healthcheck-service"
import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Inject,
    Logger,
    OnModuleInit,
    Post,
} from "@nestjs/common"

import { shopGrpcConstants } from "@apps/shop-service/src/constants"
import { ClientGrpc } from "@nestjs/microservices"
import { ApiResponse, ApiTags } from "@nestjs/swagger"
import { lastValueFrom } from "rxjs"
import { IHealthcheckService } from "../healthcheck"
import { IGameplayService } from "./gameplay.service"
import { BuySeedsRequest, BuySeedsResponse } from "@apps/shop-service/src/buy-seeds"
import { BuySuppliesRequest, BuySuppliesResponse } from "@apps/shop-service/src/buy-supplies"

@ApiTags("Gameplay")
@Controller("gameplay")
export class GameplayController implements OnModuleInit {
    private readonly logger = new Logger(GameplayController.name)

    constructor(
        @Inject(healthcheckGrpcConstants.NAME) private healthCheckServiceClient: ClientGrpc,
        @Inject(shopGrpcConstants.NAME) private shopServiceClient: ClientGrpc,
    ) {}

    private healthcheckService: IHealthcheckService
    private gameplayService: IGameplayService

    onModuleInit() {
        this.healthcheckService = this.healthCheckServiceClient.getService<IHealthcheckService>(
            healthcheckGrpcConstants.SERVICE
        )
        this.gameplayService = this.shopServiceClient.getService<IGameplayService>(
            shopGrpcConstants.SERVICE
        )

    }

    // @ApiBearerAuth()
    // @UseGuards(RestJwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ type: BuySeedsResponse })
    @Post("/buy-seeds")
    public async buySeeds(
        // @User() user: UserLike,
        @Body() request: BuySeedsRequest
    ): Promise<BuySeedsResponse> {
        // this.logger.debug(`Processing buySeeds for user ${user.id}`)
        // const buySeedRequest: BuySeedRequest = { ...request, userId: user.id }
        const buySeedRequest: BuySeedsRequest = { ...request}
        return await lastValueFrom(this.gameplayService.buySeeds(buySeedRequest))
    }

    // @ApiBearerAuth()
    // @UseGuards(RestJwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ type: BuySuppliesResponse })
    @Post("/buy-supplies")
    public async buySupplies(
        // @User() user: UserLike,
        @Body() request: BuySuppliesRequest
    ): Promise<BuySuppliesResponse> {
        // this.logger.debug(`Processing buySupplies for user ${user.id}`)
        return await lastValueFrom(this.gameplayService.buySupplies({ ...request}))
    }
}
