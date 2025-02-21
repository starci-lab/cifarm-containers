import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { Schema as MongooseSchema } from "mongoose"
import { UserSchema } from "./user.schema"

@ObjectType()
@Schema({
    timestamps: true,
})
export class UserFollowRelationSchema  extends AbstractSchema {
    // special case for followee
    @Field(() => ID)
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserSchema.name, required: true })
        followee: UserSchema | string
    
    @Field(() => ID)
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserSchema.name, required: true })
        follower: UserSchema | string
}

export const UserFollowRelationSchemaClass = SchemaFactory.createForClass(UserFollowRelationSchema)
