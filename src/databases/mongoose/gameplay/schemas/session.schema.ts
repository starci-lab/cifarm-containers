import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { AbstractSchema } from "./abstract"
import { Schema as MongooseSchema } from "mongoose"
import { UserSchema } from "./user.schema"

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
    
    @Field(() => ID)
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserSchema.name })
        user: UserSchema
}

export const SessionSchemaClass = SchemaFactory.createForClass(SessionSchema)
