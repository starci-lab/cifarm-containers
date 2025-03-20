import { Field, ID, InputType } from "@nestjs/graphql"

@InputType()
export class PlacedItemsRequest {
    @Field(() => Boolean, {
        description: "Whether to store the result in the cache",
        defaultValue: false
    })
        storeAsCache: boolean   

    @Field(() => ID, {
        description: "Current user id watching, if not provided, will use the current user",
        nullable: true
    })
        userId?: string
}
