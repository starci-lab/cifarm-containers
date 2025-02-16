import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
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
    ClaimDailyRewardRequest,
    ClaimDailyRewardResponse,
    CollectAnimalProductRequest,
    CollectAnimalProductResponse,
    ConstructBuildingRequest,
    ConstructBuildingResponse,
    CureAnimalRequest,
    CureAnimalResponse,
    DeliverProductRequest,
    DeliverProductResponse,
    FeedAnimalRequest,
    FeedAnimalResponse,
    FollowRequest,
    FollowResponse,
    GenerateSignatureRequest,
    GenerateSignatureResponse,
    HarvestCropRequest,
    HarvestCropResponse,
    HelpCureAnimalRequest,
    HelpCureAnimalResponse,
    HelpUseHerbicideRequest,
    HelpUseHerbicideResponse,
    HelpUsePesticideRequest,
    HelpUsePesticideResponse,
    HelpWaterRequest,
    HelpWaterResponse,
    IGameplayService,
    MoveRequest,
    MoveResponse,
    PlantSeedRequest,
    PlantSeedResponse,
    RefreshRequest,
    RefreshResponse,
    RequestMessageResponse,
    RetainProductRequest,
    RetainProductResponse,
    SpinRequest,
    SpinResponse,
    ThiefAnimalProductRequest,
    ThiefAnimalProductResponse,
    ThiefCropRequest,
    ThiefCropResponse,
    UnfollowRequest,
    UnfollowResponse,
    MoveInventoryRequest,
    MoveInventoryResponse,
    UpdateTutorialRequest,
    UpdateTutorialResponse,
    UpgradeBuildingRequest,
    UpgradeBuildingResponse,
    UseFertilizerRequest,
    UseFertilizerResponse,
    UseHerbicideRequest,
    UseHerbicideResponse,
    UsePesticideRequest,
    UsePesticideResponse,
    VerifySignatureRequest,
    VerifySignatureResponse,
    WaterRequest,
    WaterResponse
} from "@apps/gameplay-service"
import { ClientGrpc } from "@nestjs/microservices"
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger"
import { getGrpcData, GrpcName } from "@src/grpc"
import { User } from "@src/decorators"
import { RestJwtAuthGuard } from "@src/guards"
import { lastValueFrom } from "rxjs"
import { UserLike } from "@src/jwt"
import { InjectGrpc } from "@src/grpc/grpc.decorators"

@ApiTags("Gameplay")
@Controller({
    path: "gameplay",
    version: "1"
})
export class GameplayController implements OnModuleInit {
    private readonly logger = new Logger(GameplayController.name)

    constructor(
        @InjectGrpc()
        private readonly clientGrpc: ClientGrpc
    ) {
    }

    private gameplayService: IGameplayService

    onModuleInit() {
        this.gameplayService = this.clientGrpc.getService<IGameplayService>(
            getGrpcData(GrpcName.Gameplay).data.service
        )
    }

    // Auth
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ type: RequestMessageResponse })
    @Post("request-message")
    public async requestMessage(): Promise<RequestMessageResponse> {
        return await lastValueFrom(this.gameplayService.requestMessage({}))
    }

    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: GenerateSignatureResponse
    })
    @Post("generate-signature")
    public async generateSignature(
        @Body() request: GenerateSignatureRequest
    ): Promise<GenerateSignatureResponse> {
        return await lastValueFrom(this.gameplayService.generateSignature(request))
    }

    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: VerifySignatureResponse
    })
    @Post("verify-signature")
    public async verifySignature(
        @Body() request: VerifySignatureRequest
    ): Promise<VerifySignatureResponse> {
        return await lastValueFrom(this.gameplayService.verifySignature(request))
    }

    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: RefreshResponse
    })
    @Post("refresh")
    public async refresh(
        @Body() request: RefreshRequest
    ): Promise<RefreshResponse> {
        return await lastValueFrom(this.gameplayService.refresh(request))
    }

    // Claim
    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ type: ClaimDailyRewardResponse })
    @Post("/claim-daily-reward")
    public async claimDailyReward(
        @User() user: UserLike,
        @Body() request: ClaimDailyRewardRequest
    ): Promise<ClaimDailyRewardResponse> {
        this.logger.debug(`Processing claimDailyReward for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.claimDailyReward({
                ...request,
                userId: user?.id
            })
        )

    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ type: SpinResponse })
    @Post("/spin")
    public async spin(
        @User() user: UserLike,
        @Body() request: SpinRequest
    ): Promise<SpinResponse> {
        this.logger.debug(`Processing spin for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.spin({
                ...request,
                userId: user?.id
            })
        )
    }

    //Community
    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: FollowResponse
    })
    @Post("/follow")
    public async follow(
        @User() user: UserLike,
        @Body() request: FollowRequest
    ): Promise<FollowResponse> {
        return await lastValueFrom(
            this.gameplayService.follow({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: HelpCureAnimalResponse
    })
    @Post("/help-cure-animal")
    public async helpCureAnimal(
        @User() user: UserLike,
        @Body() request: HelpCureAnimalRequest
    ): Promise<HelpCureAnimalResponse> {
        this.logger.debug(`Processing user ${user?.id} help cure animal of user ${request?.neighborUserId}`)
        return await lastValueFrom(
            this.gameplayService.helpCureAnimal({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: HelpUseHerbicideResponse
    })
    @Post("/help-use-herbicide")
    public async helpUseHerbicide(
        @User() user: UserLike,
        @Body() request: HelpUseHerbicideRequest
    ): Promise<HelpUseHerbicideResponse> {
        return await lastValueFrom(
            this.gameplayService.helpUseHerbicide({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: HelpUsePesticideResponse
    })
    @Post("/help-use-pesticide")
    public async helpUsePesticide(
        @User() user: UserLike,
        @Body() request: HelpUsePesticideRequest
    ): Promise<HelpUsePesticideResponse> {
        return await lastValueFrom(
            this.gameplayService.helpUsePesticide({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: HelpWaterResponse
    })
    @Post("/help-water")
    public async helpWater(
        @User() user: UserLike,
        @Body() request: HelpWaterRequest
    ): Promise<HelpWaterResponse> {
        this.logger.debug(`Processing user ${user?.id} help water of user ${request?.neighborUserId}`)
        return await lastValueFrom(
            this.gameplayService.helpWater({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({
        type: ThiefAnimalProductResponse
    })
    @Post("/thief-animal-product")
    public async thiefAnimalProduct(
        @User() user: UserLike,
        @Body() request: ThiefAnimalProductRequest
    ): Promise<ThiefAnimalProductResponse> {
        return await lastValueFrom(
            this.gameplayService.thiefAnimalProduct({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({
        type: ThiefCropResponse
    })
    @Post("/thief-crop")
    public async thiefCrop(
        @User() user: UserLike,
        @Body() request: ThiefCropRequest
    ): Promise<ThiefCropResponse> {
        return await lastValueFrom(
            this.gameplayService.thiefCrop({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: UnfollowResponse
    })
    @Post("/unfollow")
    public async unfollow(
        @User() user: UserLike,
        @Body() request: UnfollowRequest
    ): Promise<UnfollowResponse> {
        return await lastValueFrom(
            this.gameplayService.unfollow({
                ...request,
                userId: user?.id
            })
        )
    }

    // Delivery
    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
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
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({
        type: RetainProductResponse
    })
    @Post("/retain-product")
    public async retainProduct(
        @User() user: UserLike,
        @Body() request: RetainProductRequest
    ): Promise<RetainProductResponse> {
        this.logger.debug(`Processing retain product for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.retainProduct({
                ...request,
                userId: user?.id
            })
        )
    }

    //Farming
    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({
        type: CollectAnimalProductResponse
    })
    @Post("/collect-animal-product")
    public async collectAnimalProduct(
        @User() user: UserLike,
        @Body() request: CollectAnimalProductRequest
    ): Promise<CollectAnimalProductResponse> {
        return await lastValueFrom(
            this.gameplayService.collectAnimalProduct({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: CureAnimalResponse
    })
    @Post("/cure-animal")
    public async cureAnimal(
        @User() user: UserLike,
        @Body() request: CureAnimalRequest
    ): Promise<CureAnimalResponse> {
        this.logger.debug(`Processing cure animal for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.cureAnimal({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: FeedAnimalResponse
    })
    @Post("/feed-animal")
    public async feedAnimal(
        @User() user: UserLike,
        @Body() request: FeedAnimalRequest
    ): Promise<FeedAnimalResponse> {
        this.logger.debug(`Processing feed animal for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.feedAnimal({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: HarvestCropResponse
    })
    @Post("/harvest-crop")
    public async harvestCrop(
        @User() user: UserLike,
        @Body() request: HarvestCropRequest
    ): Promise<HarvestCropResponse> {
        this.logger.debug(`Processing harvest crop for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.harvestCrop({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({
        type: PlantSeedResponse
    })
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
    @ApiResponse({
        type: UseFertilizerResponse
    })
    @Post("/use-fertilizer")
    public async useFertilizer(
        @User() user: UserLike,
        @Body() request: UseFertilizerRequest
    ): Promise<UseFertilizerResponse> {
        this.logger.debug(`Processing use fertilizer for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.useFertilizer({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: UseHerbicideResponse
    })
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
    @ApiResponse({
        type: UsePesticideResponse
    })
    @Post("/use-pesticide")
    public async usePesticide(
        @User() user: UserLike,
        @Body() request: UsePesticideRequest
    ): Promise<UsePesticideResponse> {
        this.logger.debug(`Processing use pesticide for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.usePesticide({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: WaterResponse
    })
    @Post("/water")
    public async water(
        @User() user: UserLike,
        @Body() request: WaterRequest
    ): Promise<WaterResponse> {
        this.logger.debug(`Processing water plant for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.water({
                ...request,
                userId: user.id
            })
        )
    }

    // Shop
    
    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({
        type: BuySeedsResponse
    })
    @Post("/buy-seeds")
    public async buySeeds(
        @User() user: UserLike,
        @Body() request: BuySeedsRequest
    ): Promise<BuySeedsResponse> {
        return await lastValueFrom(
            this.gameplayService.buySeeds({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({
        type: BuyAnimalResponse
    })
    @Post("/buy-animal")
    public async buyAnimal(
        @User() user: UserLike,
        @Body() request: BuyAnimalRequest
    ): Promise<BuyAnimalResponse> {
        return await lastValueFrom(
            this.gameplayService.buyAnimal({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({
        type: BuySuppliesResponse
    })
    @Post("/buy-supplies")
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
    @HttpCode(HttpStatus.CREATED)
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

    // Placement
    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: MoveResponse
    })
    @Post("/move")
    public async move(
        @User() user: UserLike,
        @Body() request: MoveRequest
    ): Promise<MoveResponse> {
        this.logger.debug(`Processing move for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.move({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: MoveInventoryResponse
    })
    @Post("/move-inventory")
    public async moveInventory(
        @User() user: UserLike,
        @Body() request: MoveInventoryRequest
    ): Promise<MoveInventoryResponse> {
        return await lastValueFrom(
            this.gameplayService.moveInventory({
                ...request,
                userId: user?.id
            })
        )
    }

    // Profile
    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: UpdateTutorialResponse
    })
    @Post("/update-tutorial")
    public async updateTutorial(
        @User() user: UserLike,
        @Body() request: UpdateTutorialRequest
    ): Promise<UpdateTutorialResponse> {
        this.logger.debug(`Processing update tutorial for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.updateTutorial({
                ...request,
                userId: user?.id
            })
        )
    }

    // Profile
    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: UpgradeBuildingResponse
    })
    @Post("/upgrade-building")
    public async upgradeBuilding(
        @User() user: UserLike,
        @Body() request: UpgradeBuildingRequest
    ): Promise<UpgradeBuildingResponse> {
        this.logger.debug(`Processing upgrade building for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.upgradeBuilding({
                ...request,
                userId: user?.id
            })
        )
    }
}
