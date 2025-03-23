import { Field, Float, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractPlantSchema } from "./abstract"
import { FirstCharLowerCaseFlowerId, FlowerId } from "../enums"

@ObjectType({
    description: "The flower schema"
})
@Schema({
    timestamps: true,
    collection: "flowers",
})
export class FlowerSchema extends AbstractPlantSchema {
    @Field(() => FirstCharLowerCaseFlowerId, {
        description: "The display ID of the flower"
    })
    @Prop({ type: String, enum: FlowerId, required: true, unique: true })
        displayId: FlowerId

    @Field(() => Float, {
        description: "The honey yield coefficient of the flower"
    })          
    @Prop({ type: Number, required: true })
        honeyYieldCoefficient: number

    @Field(() => Float, {
        description: "Honey quality chance plus of the flower"
    })
    @Prop({ type: Number, required: true })
        honeyQualityChancePlus: number 
}

export const FlowerSchemaClass = SchemaFactory.createForClass(FlowerSchema)
