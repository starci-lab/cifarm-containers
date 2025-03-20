import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class InventoriesRequest {
    @Field(() => Boolean, { description: "Whether to store the result in the cache" })
        storeAsCache: boolean
}   