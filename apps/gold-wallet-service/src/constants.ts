import { join } from "path"

export const goldWalletGrpcConstants = {
    NAME: "GOLD_WALLET_PACKAGE",
    SERVICE: "GoldWalletService",
    PACKAGE: "goldWallet",
    PROTO_PATH: join(process.cwd(), "proto", "gold-wallet.proto")
}
