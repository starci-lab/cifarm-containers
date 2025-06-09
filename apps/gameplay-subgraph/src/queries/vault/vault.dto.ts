import { Field, ObjectType } from "@nestjs/graphql"
import { VaultData } from "@src/databases"


@ObjectType({
    description: "Vault current response"
})
export class VaultCurrentResponse {
    @Field(() => [VaultData], { description: "The paid amount" })
        data: Array<VaultData> 

    @Field(() => String, { description: "Vault address" })
        vaultAddress: string
}