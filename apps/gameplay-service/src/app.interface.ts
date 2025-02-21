import { Observable } from "rxjs"
import {
    GenerateSignatureRequest,
    GenerateSignatureResponse,
    RefreshRequest,
    RefreshResponse,
    RequestMessageRequest,
    RequestMessageResponse,
    VerifySignatureRequest,
    VerifySignatureResponse
} from "./auth"
import {
    FollowRequest,
    FollowResponse,
    HelpCureAnimalRequest,
    HelpCureAnimalResponse,
    HelpUseHerbicideRequest,
    HelpUseHerbicideResponse,
    HelpUsePesticideRequest,
    HelpUsePesticideResponse,
    HelpWaterRequest,
    HelpWaterResponse,
    ReturnRequest,
    ReturnResponse,
    ThiefAnimalProductRequest,
    ThiefAnimalProductResponse,
    ThiefCropRequest,
    ThiefCropResponse,
    UnfollowRequest,
    UnfollowResponse,
    VisitRequest,
    VisitResponse,
} from "./community"
import {
    DeliverProductRequest,
    DeliverProductResponse,
    RetainProductRequest,
    RetainProductResponse
} from "./delivery"
import {
    HarvestCropRequest,
    HarvestCropResponse,
    PlantSeedRequest,
    PlantSeedResponse,
    UseHerbicideRequest,
    UseHerbicideResponse,
    UsePesticideRequest,
    UsePesticideResponse,
    WaterRequest,
    WaterResponse,
    CollectAnimalProductRequest,
    CollectAnimalProductResponse,
    CureAnimalRequest,
    CureAnimalResponse,
    FeedAnimalRequest,
    FeedAnimalResponse,
    UseFertilizerRequest,
    UseFertilizerResponse
} from "./farming"
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
} from "./shop"

import {
    ClaimDailyRewardRequest,
    ClaimDailyRewardResponse,
    SpinRequest,
    SpinResponse
} from "./claim"
import { MoveRequest, MoveResponse } from "./placement"
import { UpdateTutorialRequest, UpdateTutorialResponse, MoveInventoryRequest, MoveInventoryResponse } from "./player"
import { UpgradeBuildingRequest, UpgradeBuildingResponse } from "./upgrade"

export interface IGameplayService {
    // Auth
    generateSignature(
        request: GenerateSignatureRequest
    ): Observable<GenerateSignatureResponse>
    verifySignature(request: VerifySignatureRequest): Observable<VerifySignatureResponse>
    requestMessage(request: RequestMessageRequest): Observable<RequestMessageResponse>
    refresh(request: RefreshRequest): Observable<RefreshResponse>

    // Claim
    claimDailyReward(request: ClaimDailyRewardRequest): Observable<ClaimDailyRewardResponse>
    spin(request: SpinRequest): Observable<SpinResponse>

    // Community
    follow(request: FollowRequest): Observable<FollowResponse>
    helpCureAnimal(request: HelpCureAnimalRequest): Observable<HelpCureAnimalResponse>
    helpUseHerbicide(request: HelpUseHerbicideRequest): Observable<HelpUseHerbicideResponse>
    helpUsePesticide(request: HelpUsePesticideRequest): Observable<HelpUsePesticideResponse>
    helpWater(request: HelpWaterRequest): Observable<HelpWaterResponse>
    thiefAnimalProduct(request: ThiefAnimalProductRequest): Observable<ThiefAnimalProductResponse>
    thiefCrop(request: ThiefCropRequest): Observable<ThiefCropResponse>
    unfollow(request: UnfollowRequest): Observable<UnfollowResponse>
    visit(request: VisitRequest): Observable<VisitResponse>
    return(request: ReturnRequest): Observable<ReturnResponse>

    // Delivery
    deliverProduct(request: DeliverProductRequest): Observable<DeliverProductResponse>
    retainProduct(request: RetainProductRequest): Observable<RetainProductResponse>

    // Farming
    collectAnimalProduct(
        request: CollectAnimalProductRequest
    ): Observable<CollectAnimalProductResponse>
    cureAnimal(request: CureAnimalRequest): Observable<CureAnimalResponse>
    feedAnimal(request: FeedAnimalRequest): Observable<FeedAnimalResponse>
    harvestCrop(request: HarvestCropRequest): Observable<HarvestCropResponse>
    plantSeed(request: PlantSeedRequest): Observable<PlantSeedResponse>
    useFertilizer(request: UseFertilizerRequest): Observable<UseFertilizerResponse>
    useHerbicide(request: UseHerbicideRequest): Observable<UseHerbicideResponse>
    usePesticide(request: UsePesticideRequest): Observable<UsePesticideResponse>
    water(request: WaterRequest): Observable<WaterResponse>

    // Placement
    move(request: MoveRequest): Observable<MoveResponse>
    
    // Profile
    updateTutorial(request: UpdateTutorialRequest): Observable<UpdateTutorialResponse>
    moveInventory(request: MoveInventoryRequest): Observable<MoveInventoryResponse>

    // Shop
    buySeeds(request: BuySeedsRequest): Observable<BuySeedsResponse>
    buyAnimal(request: BuyAnimalRequest): Observable<BuyAnimalResponse>
    buySupplies(request: BuySuppliesRequest): Observable<BuySuppliesResponse>
    buyTile(request: BuyTileRequest): Observable<BuyTileResponse>
    constructBuilding(request: ConstructBuildingRequest): Observable<ConstructBuildingResponse>

    // Upgrade
    upgradeBuilding(request: UpgradeBuildingRequest): Observable<UpgradeBuildingResponse>
}
