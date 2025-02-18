import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { Schema as MongooseSchema } from "mongoose"

@ObjectType()
@Schema({
    timestamps: true,
})
export class FolloweeSchema extends AbstractSchema {
    @Field(() => ID)
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
        followeeId: string
}

export const FolloweeSchemaClass = SchemaFactory.createForClass(FolloweeSchema)
