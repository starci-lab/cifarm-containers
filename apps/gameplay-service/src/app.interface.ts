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
    DeliverMoreProductRequest,
    DeliverMoreProductResponse,
    DeliverProductRequest,
    DeliverProductResponse,
    RetainProductRequest,
    RetainProductResponse
} from "./delivery"
import {
    CollectAnimalProductRequest,
    CollectAnimalProductResponse,
    CureAnimalRequest,
    CureAnimalResponse,
    FeedAnimalRequest,
    FeedAnimalResponse,
    HarvestCropRequest,
    HarvestCropResponse,
    PlantSeedRequest,
    PlantSeedResponse,
    UseFertilizerRequest,
    UseFertilizerResponse,
    UseHerbicideRequest,
    UseHerbicideResponse,
    UsePesticideRequest,
    UsePesticideResponse,
    WaterRequest,
    WaterResponse
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
    BuyToolRequest,
    BuyToolResponse,
    BuyBuildingRequest,
    BuyBuildingResponse
} from "./shop"

import {
    ClaimDailyRewardRequest,
    ClaimDailyRewardResponse,
    SpinRequest,
    SpinResponse
} from "./claim"
import { ClaimHoneycombDailyRewardRequest, ClaimHoneycombDailyRewardResponse } from "./honeycomb"
import { MintOffchainTokensRequest, MintOffchainTokensResponse } from "./honeycomb"
import { MoveRequest, MoveResponse, SellRequest, SellResponse } from "./placement"
import { MoveInventoryRequest, MoveInventoryResponse, UpdateFollowXRequest, UpdateFollowXResponse, UpdateReferralRequest, UpdateReferralResponse, UpdateTutorialRequest, UpdateTutorialResponse } from "./player"
import { UpgradeBuildingRequest, UpgradeBuildingResponse } from "./upgrade"
import { BuyFruitRequest, BuyFruitResponse } from "./shop/buy-fruit"

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
    deliverMoreProduct(request: DeliverMoreProductRequest): Observable<DeliverMoreProductResponse>

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
    sell(request: SellRequest): Observable<SellResponse>
    
    // Profile
    updateTutorial(request: UpdateTutorialRequest): Observable<UpdateTutorialResponse>
    moveInventory(request: MoveInventoryRequest): Observable<MoveInventoryResponse>
    updateReferral(request: UpdateReferralRequest): Observable<UpdateReferralResponse>
    updateFollowX(request: UpdateFollowXRequest): Observable<UpdateFollowXResponse>
    
    // Shop
    buySeeds(request: BuySeedsRequest): Observable<BuySeedsResponse>
    buyAnimal(request: BuyAnimalRequest): Observable<BuyAnimalResponse>
    buySupplies(request: BuySuppliesRequest): Observable<BuySuppliesResponse>
    buyTile(request: BuyTileRequest): Observable<BuyTileResponse>
    buyBuilding(request: BuyBuildingRequest): Observable<BuyBuildingResponse>
    buyTool(request: BuyToolRequest): Observable<BuyToolResponse>
    buyFruit(request: BuyFruitRequest): Observable<BuyFruitResponse>
    
    // Upgrade
    upgradeBuilding(request: UpgradeBuildingRequest): Observable<UpgradeBuildingResponse>

    // Honeycomb
    claimHoneycombDailyReward(request: ClaimHoneycombDailyRewardRequest): Observable<ClaimHoneycombDailyRewardResponse>
    mintOffchainTokens(request: MintOffchainTokensRequest): Observable<MintOffchainTokensResponse>
}
