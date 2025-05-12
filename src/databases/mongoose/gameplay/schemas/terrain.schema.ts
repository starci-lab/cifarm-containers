import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { TerrainId, GraphQLTypeTerrainId, TerrainType, GraphQLTypeTerrainType } from "../enums"

@ObjectType({
    description: "The terrain schema"
})
@Schema({ timestamps: true, collection: "terrains" })
export class TerrainSchema extends AbstractSchema {
    @Field(() => GraphQLTypeTerrainId, {
        description: "The display ID of the terrain"
    })
    @Prop({ type: String, enum: TerrainId, required: true, unique: true })
        displayId: TerrainId
    @Field(() => Boolean, {
        description: "Whether the terrain is available in the shop"
    })
    @Prop({ type: Boolean, required: true, default: false })
        availableInShop: boolean
    @Field(() => Int, { 
        nullable: true,
        description: "The price of the terrain"
    })
    @Prop({ type: Number, required: false })
        price?: number

    @Field(() => Int, { 
        nullable: true,
        description: "The sell price of the terrain"
    })
    @Prop({ type: Number, required: false, default: 0 })
        sellPrice?: number

    @Field(() => GraphQLTypeTerrainType, {
        description: "The type of the terrain"
    })
    @Prop({ type: String, enum: TerrainType, required: true, unique: true })
        type: TerrainType

    @Field(() => Boolean, {
        description: "Whether the terrain is sellable"
    })
    @Prop({ type: Boolean, required: false })
        sellable?: boolean
}

// Generate Mongoose Schema
export const TerrainSchemaClass = SchemaFactory.createForClass(TerrainSchema)
