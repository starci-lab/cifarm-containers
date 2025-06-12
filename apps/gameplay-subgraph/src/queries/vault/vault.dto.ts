import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { VaultData } from "@src/databases"
import { GraphQLTypeNetwork, Network } from "@src/env"
import { IsEnum } from "class-validator"

@InputType({
    description: "Vault current request"
})
export class GetVaultCurrentRequest {
    @IsEnum(Network)
    @Field(() => GraphQLTypeNetwork, { description: "Network", defaultValue: Network.Testnet })
        network: Network
}

@ObjectType({
    description: "Vault current response"
})
export class GetVaultCurrentResponse {
    @Field(() => [VaultData], { description: "The paid amount" })
        data: Array<VaultData> 

    @Field(() => String, { description: "Vault address" })
        vaultAddress: string
}