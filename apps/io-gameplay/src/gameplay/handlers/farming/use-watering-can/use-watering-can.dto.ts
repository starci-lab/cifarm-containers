import { IsMongoId } from "class-validator"

export class UseWateringCanMessage {
    @IsMongoId()
        placedItemTileId: string
} 