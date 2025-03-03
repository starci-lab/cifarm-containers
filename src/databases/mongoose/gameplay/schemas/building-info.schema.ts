import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"

@ObjectType()
@Schema({ timestamps: true, autoCreate: false  })
export class BuildingInfoSchema extends AbstractSchema {
    @Field(() => Int)
    @Prop({ type: Number, default: 1 })
        currentUpgrade: number

    @Field(() => String, { nullable: true })
    @Prop({ type: String, required: false })
        buildingKey?: string
}

export const BuildingInfoSchemaClass = SchemaFactory.createForClass(BuildingInfoSchema)
