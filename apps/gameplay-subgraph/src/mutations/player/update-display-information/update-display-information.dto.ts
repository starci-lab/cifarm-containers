import { ObjectType } from "@nestjs/graphql"
import { ResponseLike } from "@src/graphql"
import { Field, InputType } from "@nestjs/graphql"
import { IsOptional, IsString } from "class-validator"

@InputType({
    description: "Update display information input"
})

export class UpdateDisplayInformationRequest {
    @IsOptional()
    @IsString()
    @Field(() => String, {
        description: "The new username of the player",
        nullable: true
    })
        username?: string

    @IsOptional()
    @IsString()
    @Field(() => String, {
        description: "The new avatar url of the player",
        nullable: true
    })
        avatarUrl?: string
}


@ObjectType({
    description: "Update display information response"
})
export class UpdateDisplayInformationResponse extends ResponseLike {}

