import { ObjectType, Field } from "@nestjs/graphql"

@ObjectType({
    isAbstract: true
})
export abstract class ResponseLike {
    @Field(() => Boolean)
        success: boolean
    @Field(() => String, { nullable: true })
        message: string
}

export interface IResponseLike<TData> {
    success: boolean
    message: string
    data?: TData
}
