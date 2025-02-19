import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { Schema as MongooseSchema } from "mongoose"
import { UserSchema } from "./user.schema"

@ObjectType()
@Schema({
    timestamps: true,
})
export class FolloweeSchema extends AbstractSchema {
    // special case for followee
    @Field(() => ID)
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserSchema.name })
        followee: UserSchema | string
}

export const FolloweeSchemaClass = SchemaFactory.createForClass(FolloweeSchema)
