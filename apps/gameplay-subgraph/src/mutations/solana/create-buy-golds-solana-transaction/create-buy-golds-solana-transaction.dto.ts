import { Field, InputType, Int, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58, IsInt, Min } from "class-validator"

@InputType({
    description: "Create Buy Golds Solana Transaction request"
})
export class CreateBuyGoldsSolanaTransactionRequest {
    @IsInt()
    @Min(0)
    @Field(() => Int)
        selectionIndex: number

    @IsBase58()
    @Field(() => String)
        accountAddress: string
}

@ObjectType({
    description: "Create Buy Golds Solana Transaction response"
})
export class CreateBuyGoldsSolanaTransactionResponseData {
    @IsBase58()
    @Field(() => String)
        serializedTx: string
}

@ObjectType({
    description: "Create Buy Golds Solana Transaction response"
})
export class CreateBuyGoldsSolanaTransactionResponse
    extends ResponseLike
    implements IResponseLike<CreateBuyGoldsSolanaTransactionResponseData>
{
    @Field(() => CreateBuyGoldsSolanaTransactionResponseData)
        data: CreateBuyGoldsSolanaTransactionResponseData
}
