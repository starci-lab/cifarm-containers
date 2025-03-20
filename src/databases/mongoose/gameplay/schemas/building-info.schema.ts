import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"

@ObjectType({
    description: "The schema for building info"
})
@Schema({ timestamps: true, autoCreate: false })
export class BuildingInfoSchema extends AbstractSchema {
    @Field(() => Int, {
        description: "The current upgrade of the building"
    })
    @Prop({ type: Number, default: 1 })
        currentUpgrade: number
}

export const BuildingInfoSchemaClass = SchemaFactory.createForClass(BuildingInfoSchema)
