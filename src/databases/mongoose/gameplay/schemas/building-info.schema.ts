import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { HydratedDocument } from "mongoose"

export type BuildingInfoDocument = HydratedDocument<BuildingInfoSchema>;


@ObjectType()
@Schema({ timestamps: true })
export class BuildingInfoSchema extends AbstractSchema {
    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        currentUpgrade: number

    @Field(() => String)
    @Prop({ type: String, required: true })
        placedItemId: string
}

export const BuildingInfoSchemaClass = SchemaFactory.createForClass(BuildingInfoSchema)
