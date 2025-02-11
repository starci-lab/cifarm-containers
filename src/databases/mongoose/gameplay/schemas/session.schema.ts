import { Field, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { AbstractSchema } from "./abstract"
import { USER_COLLECTION, UserSchema } from "./user.schema"
import { Schema as MongooseSchema } from "mongoose"

export type SessionDocument = HydratedDocument<SessionSchema>

@ObjectType()
@Schema({
    timestamps: true,
    collection: "users"
})
export class SessionSchema extends AbstractSchema {
    @Field(() => String)
    @Prop({ type: String, required: true, unique: true, length: 100 })
        refreshToken: string
    @Field(() => UserSchema)
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: USER_COLLECTION })
        user: UserSchema
    @Field(() => Date)
    @Prop({ type: Date, required: true })
        expiredAt: Date
}

export const SessionSchemaClass = SchemaFactory.createForClass(SessionSchema)
