import { InputType, Field, ObjectType } from "@nestjs/graphql"
import { GraphQLTypeNetwork, Network } from "@src/env"
import { VaultData } from "@src/databases"
import { IsEnum } from "class-validator"

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
    @Field(() => [VaultData], { description: "The paid amount" })
        data: Array<VaultData> 
}