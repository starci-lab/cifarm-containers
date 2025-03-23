import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { CropId, FirstCharLowerCaseCropId } from "../enums"
import { AbstractPlantSchema } from "./abstract"

@ObjectType({
    description: "The crop schema"
})
@Schema({
    timestamps: true,
    collection: "crops",
})
export class CropSchema extends AbstractPlantSchema {
    @Field(() => FirstCharLowerCaseCropId, {
        description: "The display ID of the crop"
    })
    @Prop({ type: String, enum: CropId, required: true, unique: true })
        displayId: CropId

    @Field(() => Int, {
        description: "The number of perennial crops"
    })
    @Prop({ type: Number, required: true, default: 1 })
        perennialCount: number
}

export const CropSchemaClass = SchemaFactory.createForClass(CropSchema)
