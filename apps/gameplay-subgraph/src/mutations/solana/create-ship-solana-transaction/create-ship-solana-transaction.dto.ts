import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58, IsString } from "class-validator"

@InputType({
    description: "Create Ship Solana Inventories Transaction request"
})
export class CreateShipSolanaTransactionRequest {
    @IsBase58()
    @Field(() => String)
        accountAddress: string

    @IsString()
    @Field(() => String)
        bulkId: string
}

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
