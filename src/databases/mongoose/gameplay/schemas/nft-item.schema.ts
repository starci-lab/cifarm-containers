import { Field, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { ChainKey, FirstCharLowerCaseChainKey, FirstCharLowerCaseNetwork, Network } from "@src/env"

@ObjectType({
    description: "NFT item schema"
})
@Schema({ timestamps: true, autoCreate: false })
export class NFTItemSchema extends AbstractSchema {
     @Field(() => FirstCharLowerCaseNetwork, {
         description: "The blockchain network of the user"
     })
        @Prop({
            type: String,
            required: true,
            enum: Network,
            default: Network.Testnet
        })
         network: Network

     @Field(() => FirstCharLowerCaseChainKey, {
         description: "The blockchain chain key for the NFT item"
     })
        @Prop({
            type: String,
            required: true,
            enum: ChainKey,
            default: ChainKey.Solana
        })
         chainKey: ChainKey  

      @Field(() => JSON, {
            description: "Traits of the NFT item"
        })
        @Prop({ type: Object, required: true })
            traits: object

    
    }
}

export const NFTItemSchemaClass = SchemaFactory.createForClass(NFTItemSchema)
