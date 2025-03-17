import { ObjectType, Field, Int } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"

@ObjectType({
    description: "The schema for tile information"
})
@Schema({ timestamps: true, autoCreate: false  })
export class TileInfoSchema extends AbstractSchema {
    @Field(() => Int, {
        description: "Times the tile has been harvested"
    })
    @Prop({ type: Number, default: 0 })
        timesHarvested: number
}

export const TileInfoSchemaClass = SchemaFactory.createForClass(TileInfoSchema)
