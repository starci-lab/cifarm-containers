import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { AppearanceChance, SpinPrizeType } from "../enums"
import { AbstractSchema } from "./abstract"
import { Schema as MongooseSchema } from "mongoose"
import { CropSchema } from "./crop.schema"
import { SupplySchema } from "./supply.schema"
import { CROP, SUPPLY } from "../constants"

// Mongoose document type
export type SpinPrizeDocument = HydratedDocument<SpinPrizeSchema>;

@ObjectType({
    description: "The schema for spin prizes that can be won"
})
@Schema({
    timestamps: true,
    collection: "spin-prizes",
})
export class SpinPrizeSchema extends AbstractSchema {
    @Field(() => SpinPrizeType, {
        description: "The type of prize"
    })
    @Prop({ type: String, required: true, enum: SpinPrizeType })
        type: SpinPrizeType

    @Field(() => ID, { 
        nullable: true,
        description: "The crop associated with this prize, if applicable"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: CropSchema.name })
    [CROP]?: CropSchema | string

    @Field(() => ID, { 
        nullable: true,
        description: "The supply associated with this prize, if applicable"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: SupplySchema.name })
    [SUPPLY]?: SupplySchema | string

    @Field(() => Int, {
        description: "The quantity of the prize"
    })
    @Prop({ type: Number, required: true })
        quantity: number

    @Field(() => AppearanceChance, {
        description: "The chance of this prize appearing"
    })
    @Prop({ type: String, required: true, enum: AppearanceChance })
        appearanceChance: AppearanceChance
}

export const SpinPrizeSchemaClass = SchemaFactory.createForClass(SpinPrizeSchema)