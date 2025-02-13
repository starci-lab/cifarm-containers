import { ObjectType, Field, Int, ID } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { AbstractSchema } from "./abstract"

// Mongoose document type
export type TileInfoDocument = HydratedDocument<TileInfoSchema>;

@ObjectType()
@Schema({ timestamps: true })
export class TileInfoSchema extends AbstractSchema {
    
    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        harvestCount: number

    @Field(() => ID)
    @Prop({ type: String, required: true })
        placedItemId: string
}

export const TileInfoSchemaClass = SchemaFactory.createForClass(TileInfoSchema)
