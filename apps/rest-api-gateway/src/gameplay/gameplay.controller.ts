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
    ConstructBuildingResponse,
    DeliverProductRequest,
    DeliverProductResponse,
    PlantSeedRequest,
    PlantSeedResponse,
    UseHerbicideRequest,
    UseHerbicideResponse,
    WaterRequest,
    WaterResponse
} from "@apps/gameplay-service"
import { gameplayGrpcConstants } from "@apps/gameplay-service/src/config"
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
            healthcheckGrpcConstants.service
        )
        this.gameplayService = this.gameplayServiceClient.getService<IGameplayService>(
            gameplayGrpcConstants.service
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

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({})
    @Post("/harvest-crop")
    public async Water(
        @User() user: UserLike,
        @Body() request: WaterRequest
    ): Promise<WaterResponse> {
        this.logger.debug(`Processing Water for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.havestCrop({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({})
    @Post("/water")
    public async water(
        @User() user: UserLike,
        @Body() request: WaterRequest
    ): Promise<WaterResponse> {
        this.logger.debug(`Processing water plant for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.water({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({})
    @Post("/plant-seed")
    public async plantSeed(
        @User() user: UserLike,
        @Body() request: PlantSeedRequest
    ): Promise<PlantSeedResponse> {
        this.logger.debug(`Processing plant seed for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.plantSeed({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({})
    @Post("/use-herbicide")
    public async useHerbicide(
        @User() user: UserLike,
        @Body() request: UseHerbicideRequest
    ): Promise<UseHerbicideResponse> {
        this.logger.debug(`Processing use herbicide for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.useHerbicide({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({})
    @Post("/use-pesticide")
    public async usePesticide(
        @User() user: UserLike,
        @Body() request: UseHerbicideRequest
    ): Promise<UseHerbicideResponse> {
        this.logger.debug(`Processing use pesticide for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.usePesticide({
                ...request,
                userId: user?.id
            })
        )
    }

    // Delivery
    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: DeliverProductResponse
    })
    @Post("/deliver-product")
    public async deliverProduct(
        @User() user: UserLike,
        @Body() request: DeliverProductRequest
    ): Promise<DeliverProductResponse> {
        this.logger.debug(`Processing deliver product for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.deliverProduct({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({})
    @Post("/retain-product")
    public async retainProduct(
        @User() user: UserLike,
        @Body() request: DeliverProductRequest
    ): Promise<DeliverProductResponse> {
        this.logger.debug(`Processing retain product for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.deliverProduct({
                ...request,
                userId: user?.id
            })
        )
    }
}
