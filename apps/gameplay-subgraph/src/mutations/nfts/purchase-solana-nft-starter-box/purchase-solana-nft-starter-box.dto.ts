import { Field, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"

@ObjectType({
    description: "Purchase Solana NFT Starter Box response"
})
export class PurchaseSolanaNFTStarterBoxResponseData  {
    @Field(() => String)
        serializedTx: string
}  

@ObjectType({
    description: "Purchase Solana NFT Starter Box response"
})
export class PurchaseSolanaNFTStarterBoxResponse extends ResponseLike implements IResponseLike<PurchaseSolanaNFTStarterBoxResponseData> {
    @Field(() => PurchaseSolanaNFTStarterBoxResponseData)
        data: PurchaseSolanaNFTStarterBoxResponseData
}  
