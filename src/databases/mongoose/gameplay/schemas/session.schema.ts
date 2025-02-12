import { Field, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { AbstractSchema } from "./abstract"

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
}

export const SessionSchemaClass = SchemaFactory.createForClass(SessionSchema)
