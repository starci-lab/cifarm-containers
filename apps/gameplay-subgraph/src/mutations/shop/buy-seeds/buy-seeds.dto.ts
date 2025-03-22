// buy-seed.dto.ts

import { CropId, FirstCharLowerCaseCropId } from "@src/databases"
import { IsInt, IsString, Min } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class BuySeedsRequest {
    @IsString()
    @Field(() => FirstCharLowerCaseCropId, { description: "The id of the seed to purchase" })
        cropId: CropId

    @IsInt()
    @Min(1)
    @Field(() => Number, { description: "The quantity of seeds to purchase" })
        quantity: number
}
