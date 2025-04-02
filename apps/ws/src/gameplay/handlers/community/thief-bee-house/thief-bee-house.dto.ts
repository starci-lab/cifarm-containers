import { IsMongoId } from "class-validator"

export class ThiefBeeHouseMessage {
    @IsMongoId()
        placedItemBuildingId: string
} 