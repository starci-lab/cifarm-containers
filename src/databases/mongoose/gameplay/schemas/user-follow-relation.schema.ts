import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { Schema as MongooseSchema } from "mongoose"
import { UserSchema } from "./user.schema"

@ObjectType({
    description: "The schema for user follow relationships"
})
@Schema({
    timestamps: true,
    collection: "user-follow-relations"
})
export class UserFollowRelationSchema extends AbstractSchema {
    // special case for followee
    @Field(() => ID, {
        description: "The user being followed (followee)"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserSchema.name, required: true })
        followee: UserSchema | string
    
    @Field(() => ID, {
        description: "The user who is following (follower)"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserSchema.name, required: true })
        follower: UserSchema | string
}

export const UserFollowRelationSchemaClass = SchemaFactory.createForClass(UserFollowRelationSchema)
