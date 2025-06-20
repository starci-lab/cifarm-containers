import {ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { Field, InputType } from "@nestjs/graphql"
import { IsEnum, IsOptional, IsString, IsUrl } from "class-validator"
import { GraphQLTypeObjectCannedACL, ObjectCannedACL } from "@src/s3"

@InputType({
    description: "Create signed url request"
})
export class CreateSignedUrlRequest {
    @IsString()
    @Field(() => String, {
        description: "The key of the file"
    })
        key: string

    @IsOptional()
    @IsString()
    @Field(() => String, {
        description: "The content type of the file",
        nullable: true
    })
        contentType?: string

    @IsOptional()
    @IsEnum(ObjectCannedACL)
    @Field(() => GraphQLTypeObjectCannedACL, {
        description: "The acl of the file",
        nullable: true
    })
        acl?: ObjectCannedACL
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

