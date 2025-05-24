import { Field, InputType, Int, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58, IsInt, Min } from "class-validator"

@InputType({
    description: "Create Buy Energy Solana Transaction request"
})
export class CreateBuyEnergySolanaTransactionRequest {
    @IsInt()
    @Min(0)
    @Field(() => Int)
        selectionIndex: number

    @IsBase58()
    @Field(() => String)
        accountAddress: string
}

@ObjectType({
    description: "Create Buy Energy Solana Transaction response"
})
export class CreateBuyEnergySolanaTransactionResponseData {
    @IsBase58()
    @Field(() => String)
        serializedTx: string
}

@ObjectType({
    description: "Create Buy Energy Solana Transaction response"
})
export class CreateBuyEnergySolanaTransactionResponse
    extends ResponseLike
    implements IResponseLike<CreateBuyEnergySolanaTransactionResponseData>
{
    @Field(() => CreateBuyEnergySolanaTransactionResponseData)
        data: CreateBuyEnergySolanaTransactionResponseData
}
