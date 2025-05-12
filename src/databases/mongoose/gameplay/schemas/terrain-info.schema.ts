import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"

@ObjectType({
    description: "The schema for pet info"
})
@Schema({ timestamps: true, autoCreate: false })
export class TerrainInfoSchema extends AbstractSchema {
    @Field(() => Int, {
        description: "The count of chop of the terrain",
        nullable: true
    })
    @Prop({ type: Number, nullable: true })
        chopCount?: number
}

export const TerrainInfoSchemaClass = SchemaFactory.createForClass(TerrainInfoSchema)
