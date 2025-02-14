import { ObjectType, Field, Int } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"

@ObjectType()
@Schema({ timestamps: true, autoCreate: false  })
export class TileInfoSchema extends AbstractSchema {
    
    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        harvestCount: number
}

export const TileInfoSchemaClass = SchemaFactory.createForClass(TileInfoSchema)
