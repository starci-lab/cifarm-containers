import { Observable } from "rxjs"
import { GetCropRequest, GetCropResponse, GetCropsResponse } from "./crop"
import { GetAnimalRequest, GetAnimalResponse, GetAnimalsResponse } from "./animal"
import { GetBuildingRequest, GetBuildingResponse } from "./building"

export interface IStaticService {
    //crop
    GetCrop(request: GetCropRequest): Observable<GetCropResponse>
    GetCrops(): Observable<GetCropsResponse>

    //animal
    GetAnimal(request: GetAnimalRequest): Observable<GetAnimalResponse>
    GetAnimals(): Observable<GetAnimalsResponse>

    //building
    GetBuilding(request: GetBuildingRequest): Observable<GetBuildingResponse>
    GetBuildings(): Observable<GetBuildingResponse>
}