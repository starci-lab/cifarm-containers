import { IsMongoId } from "class-validator"

export class HarvestBeeHouseMessage {
    @IsMongoId()
        placedItemBuildingId: string
} 