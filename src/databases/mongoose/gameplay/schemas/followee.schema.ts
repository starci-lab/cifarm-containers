import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"

@ObjectType()
@Schema({
    timestamps: true,
})
export class FolloweeSchema extends AbstractSchema {
    @Field(() => ID)
        id: string
}

export const FolloweeSchemaClass = SchemaFactory.createForClass(FolloweeSchema)
