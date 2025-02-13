import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"

@Schema({
    timestamps: true,
    collection: "key-value-stores",
})
export class KeyValueStoreSchema extends AbstractSchema {
    @Prop({ type: Object, required: true })
        value: object
}

// Generate Mongoose Schema
export const KeyValueStoreSchemaClass = SchemaFactory.createForClass(KeyValueStoreSchema)