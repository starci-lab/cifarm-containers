// buy-seed.dto.ts

import { CropId } from "@src/databases"
import { IsEnum, IsInt, Min } from "class-validator"

export class BuyCropSeedsMessage {
    @IsEnum(CropId)
        cropId: CropId

    @IsInt()
    @Min(1)
        quantity: number
}
