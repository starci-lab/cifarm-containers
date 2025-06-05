import { Field, InputType, Int, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58, IsInt, Min } from "class-validator"

@InputType({
    description: "Create Expand Land Limit Solana Transaction request"
})
export class CreateExpandLandLimitSolanaTransactionRequest {
    @IsInt()
    @Min(0)
    @Field(() => Int)
        selectionIndex: number

    @IsBase58()
    @Field(() => String)
        accountAddress: string
}

@ObjectType({
    description: "Create Expand Land Limit Solana Transaction response"
})
export class CreateExpandLandLimitSolanaTransactionResponseData {
    @IsBase58()
    @Field(() => String)
        serializedTx: string
}

@ObjectType({
    description: "Create Expand Land Limit Solana Transaction response"
})
export class CreateExpandLandLimitSolanaTransactionResponse
    extends ResponseLike
    implements IResponseLike<CreateExpandLandLimitSolanaTransactionResponseData>
{
    @Field(() => CreateExpandLandLimitSolanaTransactionResponseData)
        data: CreateExpandLandLimitSolanaTransactionResponseData
}
