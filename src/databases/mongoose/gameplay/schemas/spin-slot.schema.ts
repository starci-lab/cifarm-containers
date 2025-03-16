import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { SpinPrizeSchema } from "./spin-prize.schema"
import { Schema as MongooseSchema } from "mongoose"
import { SPIN_PRIZE } from "../constants"

@ObjectType({
    description: "The schema for spin slots in the wheel"
})
@Schema({
    timestamps: true,
    collection: "spin-slot"
})
export class SpinSlotSchema extends AbstractSchema {
    @Field(() => ID, {
        description: "The prize associated with this spin slot"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: SpinPrizeSchema.name })
    [SPIN_PRIZE]: SpinPrizeSchema | string
}

export const SpinSlotSchemaClass = SchemaFactory.createForClass(SpinSlotSchema)
