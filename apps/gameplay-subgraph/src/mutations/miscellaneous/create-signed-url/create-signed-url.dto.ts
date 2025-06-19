import { ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { Field, InputType } from "@nestjs/graphql"
import { IsString, IsUrl } from "class-validator"

@InputType({
    description: "Create signed url request"
})
export class CreateSignedUrlRequest {
    @IsString()
    @Field(() => String, {
        description: "The key of the file"
    })
        key: string
}   

@ObjectType()
export class CreateSignedUrlResponseData {
    @IsUrl()
    @Field(() => String, {
        description: "The signed url"
    })
        signedUrl: string
}

@ObjectType({
    description: "Create signed url response"
})
export class CreateSignedUrlResponse extends ResponseLike implements IResponseLike<CreateSignedUrlResponseData> {
    @Field(() => CreateSignedUrlResponseData)
        data: CreateSignedUrlResponseData
}

