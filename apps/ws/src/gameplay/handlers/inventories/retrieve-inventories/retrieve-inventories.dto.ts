import { IsMongoId } from "class-validator"

export class RetrieveInventoriesMessage {
    @IsMongoId({ each: true })
        inventoryIds: Array<string>
} 