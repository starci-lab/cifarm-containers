import { Observable } from "rxjs"
import {
    GenerateTestSignatureRequest,
    GenerateTestSignatureResponse,
    VerifySignatureRequest,
    VerifySignatureResponse,
    RequestMessageRequest,
    RequestMessageResponse
} from "./auth"
import {
    DeliverProductRequest,
    DeliverProductResponse,
    RetainProductRequest,
    RetainProductResponse
} from "./delivery"
import {
    HarvestCropRequest,
    HarvestCropResponse,
    WaterRequest,
    WaterResponse,
    PlantSeedRequest,
    PlantSeedResponse,
    UseHerbicideRequest,
    UseHerbicideResponse,
    UsePesticideRequest,
    UsePesticideResponse
} from "./farming"
import {
    BuySeedsRequest,
    BuySeedsResponse,
    BuyAnimalRequest,
    BuyAnimalResponse,
    BuySuppliesRequest,
    BuySuppliesResponse,
    BuyTileRequest,
    BuyTileResponse,
    ConstructBuildingRequest,
    ConstructBuildingResponse
} from "./shop"
import { HelpWaterRequest, HelpWaterResponse } from "./community/help-water"
import { HelpUseHerbicideRequest, HelpUseHerbicideResponse } from "./community/help-use-herbicide"
import { HelpUsePesticideRequest, HelpUsePesticideResponse } from "./community/help-use-pesticide"
import { TheifCropRequest, TheifCropResponse } from "./community/theif-crop"
import {
    TheifAnimalProductRequest,
    TheifAnimalProductResponse
} from "./community/theif-animal-product"
import { SpeedUpRequest, SpeedUpResponse } from "./dev/speed-up"
import { DeliverInstantlyRequest, DeliverInstantlyResponse } from "./dev/deliver-instantly"

export interface IGameplayService {
    // Auth
    generateTestSignature(
        request: GenerateTestSignatureRequest
    ): Observable<GenerateTestSignatureResponse>
    verifySignature(request: VerifySignatureRequest): Observable<VerifySignatureResponse>
    requestMessage(request: RequestMessageRequest): Observable<RequestMessageResponse>

    // Shop
    buySeeds(request: BuySeedsRequest): Observable<BuySeedsResponse>
    buyAnimal(request: BuyAnimalRequest): Observable<BuyAnimalResponse>
    buySupplies(request: BuySuppliesRequest): Observable<BuySuppliesResponse>
    buyTile(request: BuyTileRequest): Observable<BuyTileResponse>
    constructBuilding(request: ConstructBuildingRequest): Observable<ConstructBuildingResponse>

    //Farming
    harvestCrop(request: HarvestCropRequest): Observable<HarvestCropResponse>
    water(request: WaterRequest): Observable<WaterResponse>
    plantSeed(request: PlantSeedRequest): Observable<PlantSeedResponse>
    useHerbicide(request: UseHerbicideRequest): Observable<UseHerbicideResponse>
    usePesticide(request: UsePesticideRequest): Observable<UsePesticideResponse>

    //Delivery
    deliverProduct(request: DeliverProductRequest): Observable<DeliverProductResponse>
    retainProduct(request: RetainProductRequest): Observable<RetainProductResponse>

    //Community
    helpWater(request: HelpWaterRequest): Observable<HelpWaterResponse>
    helpUseHerbicide(request: HelpUseHerbicideRequest): Observable<HelpUseHerbicideResponse>
    helpUsePesticide(request: HelpUsePesticideRequest): Observable<HelpUsePesticideResponse>
    theifCrop(request: TheifCropRequest): Observable<TheifCropResponse>
    theifAnimalProduct(request: TheifAnimalProductRequest): Observable<TheifAnimalProductResponse>

    //Dev
    speedUp(request: SpeedUpRequest): Observable<SpeedUpResponse>
    deliverInstantly(request: DeliverInstantlyRequest): Observable<DeliverInstantlyResponse>
}
