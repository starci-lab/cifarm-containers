import { IsMongoId } from "class-validator"

export class UsePesticideMessage {
    @IsMongoId()
        placedItemTileId: string
} 