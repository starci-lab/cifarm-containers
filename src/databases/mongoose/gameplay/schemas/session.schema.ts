import { Field, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { AbstractSchema } from "./abstract"
import { Schema as MongooseSchema } from "mongoose"
import { USER_COLLECTION, UserSchema } from "./user.schema"

export type SessionDocument = HydratedDocument<SessionSchema>

@ObjectType()
@Schema({
    timestamps: true,
    collection: "sessions",
})
export class SessionSchema extends AbstractSchema {
    @Field(() => String)
    @Prop({ type: String, required: true, unique: true, length: 100 })
        refreshToken: string

    @Field(() => Date)
    @Prop({ type: Date, required: true })
        expiredAt: Date
    
    @Field(() => UserSchema)
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: USER_COLLECTION })
        user: MongooseSchema.Types.ObjectId
}

export const SessionSchemaClass = SchemaFactory.createForClass(SessionSchema)
