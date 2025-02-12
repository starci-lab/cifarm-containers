import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { AppearanceChance, SpinPrizeType } from "../enums"
import { AbstractSchema } from "./abstract"

// Mongoose document type
export type SpinPrizeDocument = HydratedDocument<SpinPrizeSchema>;

@ObjectType()
@Schema({
    timestamps: true,
    collection: "spin-prizes",
})
export class SpinPrizeSchema extends AbstractSchema {
    @Field(() => String)
    @Prop({ type: String, required: true, enum: SpinPrizeType })
        type: SpinPrizeType

    @Field(() => String, { nullable: true })
    @Prop({ type: String, required: false })
        refKey?: string

    @Field(() => Int)
    @Prop({ type: Number, required: true })
        quantity: number

    @Field(() => String)
    @Prop({ type: String, required: true, enum: AppearanceChance })
        appearanceChance: AppearanceChance
}

export const SpinPrizeSchemaClass = SchemaFactory.createForClass(SpinPrizeSchema)