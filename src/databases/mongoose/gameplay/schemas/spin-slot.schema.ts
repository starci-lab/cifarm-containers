import { Field, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { AbstractSchema } from "./abstract"

// Mongoose document type
export type SpinSlotDocument = HydratedDocument<SpinSlotSchema>;

@ObjectType()
@Schema({
    timestamps: true,
    collection: "spin-slot",
})
export class SpinSlotSchema extends AbstractSchema {
    @Field(() => String)
    @Prop({ type: String, required: true })
        spinPrizeId: string
}

export const SpinSlotSchemaClass = SchemaFactory.createForClass(SpinSlotSchema)