import { Field, InputType } from "@nestjs/graphql"
import { IsEnum } from "class-validator"
import { GraphQLTypeNetwork, Network } from "@src/env"

@InputType({
    description: "Get bulk paids request"
})
export class GetBulkPaidsRequest {
    @IsEnum(Network)
    @Field(() => GraphQLTypeNetwork, { description: "Network", defaultValue: Network.Testnet })
        network: Network
}