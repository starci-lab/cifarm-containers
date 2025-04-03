import { Module } from "@nestjs/common"
import { CreateSolanaMetaplexCollectionCommand } from "./create-solana-metaplex-collection.command"


@Module({
    providers: [ CreateSolanaMetaplexCollectionCommand ],
})
export class CreateSolanaMetaplexCollectionModule {}