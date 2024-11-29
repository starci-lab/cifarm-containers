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

import {
    BuyAnimalRequest,
    BuyAnimalResponse,
    BuySeedsRequest,
    BuySeedsResponse,
    BuySuppliesRequest,
    BuySuppliesResponse,
    BuyTileRequest,
    BuyTileResponse,
    ConstructBuildingRequest,
    ConstructBuildingResponse
} from "@apps/gameplay-service"
import { gameplayGrpcConstants } from "@apps/gameplay-service/src/app.constants"
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
        @Inject(gameplayGrpcConstants.NAME) private gameplayServiceClient: ClientGrpc
    ) {}

    private healthcheckService: IHealthcheckService
    private gameplayService: IGameplayService

    onModuleInit() {
        this.healthcheckService = this.healthCheckServiceClient.getService<IHealthcheckService>(
            healthcheckGrpcConstants.SERVICE
        )
        this.gameplayService = this.gameplayServiceClient.getService<IGameplayService>(
            gameplayGrpcConstants.SERVICE
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({})
    @Post("/buy-seeds")
    public async buySeeds(
        @User() user: UserLike,
        @Body() request: BuySeedsRequest
    ): Promise<BuySeedsResponse> {
        this.logger.debug(`Processing buySeeds for user ${user?.id}`)

        return await lastValueFrom(
            this.gameplayService.buySeeds({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: BuyAnimalResponse
    })
    @Post("/buy-animal")
    public async buyAnimal(
        @User() user: UserLike,
        @Body() request: BuyAnimalRequest
    ): Promise<BuyAnimalResponse> {
        this.logger.debug(`Processing buyAnimal for user ${user?.id}`)

        return await lastValueFrom(
            this.gameplayService.buyAnimal({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({})
    public async buySupplies(
        @User() user: UserLike,
        @Body() request: BuySuppliesRequest
    ): Promise<BuySuppliesResponse> {
        this.logger.debug(`Processing buySupplies for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.buySupplies({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: BuyTileResponse
    })
    @Post("/buy-tile")
    public async buyTile(
        @User() user: UserLike,
        @Body() request: BuyTileRequest
    ): Promise<BuyTileResponse> {
        this.logger.debug(`Processing buyTile for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.buyTile({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: ConstructBuildingResponse
    })
    @Post("/construct-building")
    public async constructBuilding(
        @User() user: UserLike,
        @Body() request: ConstructBuildingRequest
    ): Promise<ConstructBuildingResponse> {
        this.logger.debug(`Processing constructBuilding for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.constructBuilding({
                ...request,
                userId: user?.id
            })
        )
    }
}
