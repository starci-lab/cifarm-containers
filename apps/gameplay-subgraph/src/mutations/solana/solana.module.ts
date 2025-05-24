import { Module } from "@nestjs/common"
import { CreatePurchaseSolanaNFTBoxesTransactionModule } from "./create-purchase-solana-nft-boxes-transaction"
import { SendPurchaseSolanaNFTBoxesTransactionModule } from "./send-purchase-solana-nft-boxes-transaction"
import { CreateShipSolanaTransactionModule } from "./create-ship-solana-transaction"
import { SendShipSolanaTransactionModule } from "./send-ship-solana-transaction"
import { CreateWrapSolanaMetaplexNFTTransactionModule } from "./create-wrap-solana-metaplex-nft-transaction"
import { SendWrapSolanaMetaplexNFTTransactionModule } from "./send-wrap-solana-metaplex-nft-transaction"
import { SendUnwrapSolanaMetaplexNFTTransactionModule } from "./send-unwrap-solana-metaplex-nft-transaction"
import { CreateUnwrapSolanaMetaplexNFTTransactionModule } from "./create-unwrap-solana-metaplex-nft-transaction"
import { CreateBuyGoldsSolanaTransactionModule } from "./create-buy-golds-solana-transaction"
import { SendBuyGoldsSolanaTransactionModule } from "./send-buy-golds-solana-transaction"
import { CreateConvertSolanaMetaplexNFTsTransactionModule } from "./create-convert-solana-metaplex-nfts-transaction"
import { SendConvertSolanaMetaplexNFTsTransactionModule } from "./send-convert-metaplex-solana-nfts-transaction"
import { CreateBuyEnergySolanaTransactionModule } from "./create-buy-energy-solana-transaction"
import { SendBuyEnergySolanaTransactionModule } from "./send-buy-energy-solana-transaction"

@Module({
    imports: [
        CreatePurchaseSolanaNFTBoxesTransactionModule,
        SendPurchaseSolanaNFTBoxesTransactionModule,
        CreateShipSolanaTransactionModule,
        SendShipSolanaTransactionModule,
        CreateWrapSolanaMetaplexNFTTransactionModule,
        SendWrapSolanaMetaplexNFTTransactionModule,
        SendUnwrapSolanaMetaplexNFTTransactionModule,
        CreateUnwrapSolanaMetaplexNFTTransactionModule,
        CreateBuyGoldsSolanaTransactionModule,
        SendBuyGoldsSolanaTransactionModule,
        CreateConvertSolanaMetaplexNFTsTransactionModule,
        SendConvertSolanaMetaplexNFTsTransactionModule,
        CreateBuyEnergySolanaTransactionModule,
        SendBuyEnergySolanaTransactionModule
    ]
})
export class SolanaModule {}
