import { healthcheckGrpcConstants } from "@apps/healthcheck-service"
import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Inject,
    Logger,
    OnModuleInit,
    Post,
    UseGuards
} from "@nestjs/common"

import { BuySeedsControllerRequest, BuySeedsResponse } from "@apps/shop-service/src/buy-seeds"
import {
    BuySuppliesControllerRequest,
    BuySuppliesResponse
} from "@apps/shop-service/src/buy-supplies"
import { shopGrpcConstants } from "@apps/shop-service/src/constants"
import { ClientGrpc } from "@nestjs/microservices"
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger"
import { User } from "@src/decorators"
import { RestJwtAuthGuard } from "@src/guards"
import { UserLike } from "@src/services"
import { lastValueFrom } from "rxjs"
import { IHealthcheckService } from "../healthcheck"
import { IGameplayService } from "./gameplay.service"

@ApiTags("Gameplay")
@Controller("gameplay")
export class GameplayController implements OnModuleInit {
    private readonly logger = new Logger(GameplayController.name)

    constructor(
        @Inject(healthcheckGrpcConstants.NAME) private healthCheckServiceClient: ClientGrpc,
        @Inject(shopGrpcConstants.NAME) private shopServiceClient: ClientGrpc
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

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ type: BuySeedsResponse })
    @Post("/buy-seeds")
    public async buySeeds(
        @User() user: UserLike,
        @Body() request: BuySeedsControllerRequest
    ): Promise<BuySeedsResponse> {
        this.logger.debug(`Processing buySeeds for user ${user?.id}`)

        return await lastValueFrom(
            this.gameplayService.buySeeds({
                key: request.key,
                quantity: request.quantity,
                userId: user.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ type: BuySuppliesResponse })
    @Post("/buy-supplies")
    public async buySupplies(
        @User() user: UserLike,
        @Body() request: BuySuppliesControllerRequest
    ): Promise<BuySuppliesResponse> {
        this.logger.debug(`Processing buySeeds for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.buySupplies({
                key: request.key,
                quantity: request.quantity,
                userId: user.id
            })
        )
    }
}
