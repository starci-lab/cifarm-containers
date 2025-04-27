import { Field, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58 } from "class-validator"

@ObjectType({
    description: "Create Ship Solana Inventories Transaction response"
})
export class CreateShipSolanaTransactionResponseData {
    @IsBase58()
    @Field(() => String)
        serializedTx: string
}

@ObjectType({
    description: "Create Ship Solana Transaction response"
})
export class CreateShipSolanaTransactionResponse
    extends ResponseLike
    implements IResponseLike<CreateShipSolanaTransactionResponseData>
{
    @Field(() => CreateShipSolanaTransactionResponseData)
        data: CreateShipSolanaTransactionResponseData
}
