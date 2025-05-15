import { IsMongoId } from "class-validator"

export class DeliverInventoriesMessage {
    @IsMongoId({ each: true })
        inventoryIds: Array<string>
} 