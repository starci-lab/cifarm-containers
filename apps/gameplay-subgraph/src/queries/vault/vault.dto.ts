import { InputType, Field, ObjectType, Float, Int } from "@nestjs/graphql"
import { GraphQLTypeNetwork, Network } from "@src/env"
import { IsEnum, IsInt, Min } from "class-validator"

@InputType({
    description: "Get vault current request"
})
export class VaultCurrentRequest {
    @IsEnum(Network)
    @Field(() => GraphQLTypeNetwork, { description: "The network to check" })
        network: Network
}

@ObjectType({
    description: "Vault current response"
})
export class VaultCurrentResponse {
    @Min(0)
    @Field(() => Float, { description: "The paid amount" })
        paidAmount: number

    @IsInt()
    @Min(0)
    @Field(() => Int, { description: "The number of ships paid" })
        paidCount: number

    @Min(0)
    @Field(() => Float, { description: "The total amount of token locked" })
        tokenLocked: number 
}