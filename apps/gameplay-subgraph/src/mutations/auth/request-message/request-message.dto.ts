import { IsUUID } from "class-validator"
import { ObjectType, Field } from "@nestjs/graphql"
import { ResponseLike, IResponseLike } from "@src/graphql"
@ObjectType()
export class RequestMessageResponseData {
    @IsUUID("4")
    @Field(() => String, { description: "Message to generate signature for" })
        message: string
}

@ObjectType()
export class RequestMessageResponse
    extends ResponseLike
    implements IResponseLike<RequestMessageResponseData>
{
    @Field(() => RequestMessageResponseData)
        data: RequestMessageResponseData
}
