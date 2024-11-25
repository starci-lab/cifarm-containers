import { healthcheckGrpcConstants } from "@apps/healthcheck-service"
import { Controller, Inject, Logger, OnModuleInit } from "@nestjs/common"

import { gameplayGrpcConstants } from "@apps/gameplay-service/src/app.constants"
import { ClientGrpc } from "@nestjs/microservices"
import { ApiTags } from "@nestjs/swagger"
import { IHealthcheckService } from "../healthcheck"
import { IGameplayService } from "./gameplay.service"

@ApiTags("Gameplay")
@Controller("gameplay")
export class GameplayController implements OnModuleInit {
    private readonly logger = new Logger(GameplayController.name)

    constructor(
        @Inject(healthcheckGrpcConstants.NAME) private healthCheckServiceClient: ClientGrpc,
        @Inject(gameplayGrpcConstants.NAME) private shopServiceClient: ClientGrpc
    ) {}

    private healthcheckService: IHealthcheckService
    private gameplayService: IGameplayService

    onModuleInit() {
        this.healthcheckService = this.healthCheckServiceClient.getService<IHealthcheckService>(
            healthcheckGrpcConstants.SERVICE
        )
        this.gameplayService = this.shopServiceClient.getService<IGameplayService>(
            gameplayGrpcConstants.SERVICE
        )
    }

    // @UseGuards(RestJwtAuthGuard)
    // @ApiBearerAuth()
    // @HttpCode(HttpStatus.OK)
    // @ApiResponse({ type: BuySeedsResponse })
    // @Post("/buy-seeds")
    // public async buySeeds(
    //     @User() user: UserLike,
    //     @Body() request: BuySeedsControllerRequest
    // ): Promise<BuySeedsResponse> {
    //     this.logger.debug(`Processing buySeeds for user ${user?.id}`)

    //     return await lastValueFrom(
    //         this.gameplayService.buySeeds({
    //             key: request.key,
    //             quantity: request.quantity,
    //             userId: user.id
    //         })
    //     )
    // }

    // @UseGuards(RestJwtAuthGuard)
    // @ApiBearerAuth()
    // @HttpCode(HttpStatus.OK)
    // @ApiResponse({ type: BuySuppliesResponse })
    // @Post("/buy-supplies")
    // public async buySupplies(
    //     @User() user: UserLike,
    //     @Body() request: BuySuppliesControllerRequest
    // ): Promise<BuySuppliesResponse> {
    //     this.logger.debug(`Processing buySeeds for user ${user?.id}`)
    //     return await lastValueFrom(
    //         this.gameplayService.buySupplies({
    //             key: request.key,
    //             quantity: request.quantity,
    //             userId: user.id
    //         })
    //     )
    // }

    // @UseGuards(RestJwtAuthGuard)
    // @ApiBearerAuth()
    // @HttpCode(HttpStatus.OK)
    // @ApiResponse({ type: BuySuppliesResponse })
    // @Post("/construct-building")
    // public async constructBuilding(
    //     @User() user: UserLike,
    //     @Body() request: ConstructBuildingControllerRequest
    // ): Promise<ConstructBuildingResponse> {
    //     this.logger.debug(`Processing buySeeds for user ${user?.id}`)
    //     return await lastValueFrom(
    //         this.gameplayService.constructBuilding({
    //             ...request,
    //             userId: user.id
    //         })
    //     )
    // }
}
