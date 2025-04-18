// buy-seed.dto.ts

import { FlowerId } from "@src/databases"
import { IsEnum, IsInt, Min } from "class-validator"

export class BuyFlowerSeedsMessage {
    @IsEnum(FlowerId)
        flowerId: FlowerId

    @IsInt()
    @Min(1)
        quantity: number
}
