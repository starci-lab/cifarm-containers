import { IsMongoId } from "class-validator"

export class UpgradeBuildingMessage {
    @IsMongoId()
        placedItemBuildingId: string
}