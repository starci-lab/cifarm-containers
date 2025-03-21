import { Field, InputType } from "@nestjs/graphql"
import { IsBoolean, IsOptional } from "class-validator"

@InputType()
export class InventoriesRequest {
    @IsOptional()
    @IsBoolean()
    @Field(() => Boolean, {
        description: "Whether to store the result in the cache",
        defaultValue: false
    })
        storeAsCache: boolean
}
