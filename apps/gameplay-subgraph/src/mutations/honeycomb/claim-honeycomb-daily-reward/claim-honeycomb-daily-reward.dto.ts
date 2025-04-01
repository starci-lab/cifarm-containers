import { ObjectType, Field } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { TxResponse } from "../types"

@ObjectType()
export class ClaimHoneycombDailyRewardResponse
    extends ResponseLike
    implements IResponseLike<TxResponse>
{
    @Field(() => TxResponse)
        data: TxResponse
}
