import { InputType, Field, ObjectType, Float } from "@nestjs/graphql"
import { GraphQLTypeNetwork, Network } from "@src/env"
import { IsEnum, Min } from "class-validator"

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

    @Min(0)
    @Field(() => Float, { description: "The total amount of token locked" })
        tokenLocked: number 
}