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
    HarvestCropRequest,
    HarvestCropResponse,
    PlantSeedRequest,
    PlantSeedResponse,
    UseHerbicideRequest,
    UseHerbicideResponse,
    UsePesticideRequest,
    UsePesticideResponse,
    WaterRequest,
    WaterResponse
} from "@apps/gameplay-service"
import { Observable } from "rxjs"
export interface IGameplayService {
    // Shop
    buySeeds(request: BuySeedsRequest): Observable<BuySeedsResponse>
    buyAnimal(request: BuyAnimalRequest): Observable<BuyAnimalResponse>
    buySupplies(request: BuySuppliesRequest): Observable<BuySuppliesResponse>
    buyTile(request: BuyTileRequest): Observable<BuyTileResponse>
    constructBuilding(request: ConstructBuildingRequest): Observable<ConstructBuildingResponse>

    //Farming
    havestCrop(request: HarvestCropRequest): Observable<HarvestCropResponse>
    water(request: WaterRequest): Observable<WaterResponse>
    plantSeed(request: PlantSeedRequest): Observable<PlantSeedResponse>
    useHerbicide(request: UseHerbicideRequest): Observable<UseHerbicideResponse>
    usePesticide(request: UsePesticideRequest): Observable<UsePesticideResponse>

    //Delivery
}
