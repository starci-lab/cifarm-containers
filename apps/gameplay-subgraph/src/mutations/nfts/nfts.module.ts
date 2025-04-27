import { Module } from "@nestjs/common"
import { CreatePurchaseSolanaNFTStarterBoxTransactionModule } from "./create-purchase-solana-nft-starter-box-transaction"
import { SendPurchaseSolanaNFTStarterBoxTransactionModule } from "./send-purchase-solana-nft-starter-box-transaction"
import { CreateShipSolanaTransactionModule } from "./create-ship-solana-transaction"
import { SendShipSolanaTransactionModule } from "./send-ship-solana-transaction"
import { CreateWrapSolanaMetaplexNFTTransactionModule } from "./create-wrap-solana-metaplex-nft-transaction"
import { SendWrapSolanaMetaplexNFTTransactionModule } from "./send-wrap-solana-metaplex-nft-transaction"
import { SendUnwrapSolanaMetaplexNFTTransactionModule } from "./send-unwrap-solana-metaplex-nft-transaction"
import { CreateUnwrapSolanaMetaplexNFTTransactionModule } from "./create-unwrap-solana-metaplex-nft-transaction"

@Module({
    imports: [
        CreatePurchaseSolanaNFTStarterBoxTransactionModule,
        SendPurchaseSolanaNFTStarterBoxTransactionModule,
        CreateShipSolanaTransactionModule,
        SendShipSolanaTransactionModule,
        CreateWrapSolanaMetaplexNFTTransactionModule,
        SendWrapSolanaMetaplexNFTTransactionModule,
        SendUnwrapSolanaMetaplexNFTTransactionModule,
        CreateUnwrapSolanaMetaplexNFTTransactionModule
    ]
})
export class NFTsModule {}
