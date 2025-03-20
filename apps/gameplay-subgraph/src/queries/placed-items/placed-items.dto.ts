import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class PlacedItemsRequest {
    @Field(() => Boolean, {
        description: "Whether to store the result in the cache",
        defaultValue: false
    })
        storeAsCache: boolean   
}
