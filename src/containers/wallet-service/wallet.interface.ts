import { GetBalanceRequest, GetBalanceResponse } from "@apps/wallet-service/src/balance"
import {
    AddGoldRequest,
    GetGoldBalanceRequest,
    GetGoldBalanceResponse,
    SubtractGoldRequest,
    SubtractGoldResponse
} from "@apps/wallet-service/src/gold"
import { GetTokenBalanceRequest, GetTokenBalanceResponse } from "@apps/wallet-service/src/token"

export interface IWalletService {
    // getGoldBalance(request: GetGoldBalanceRequest): Promise<GetGoldBalanceResponse>
    // addGold(request: AddGoldRequest): Promise<Subtr>
    // subtractGold(request: SubtractGoldRequest): Promise<SubtractGoldResponse>
    // getTokenBalance(request: GetTokenBalanceRequest): Promise<GetTokenBalanceResponse>
    // addToken(request: TokenRequest): Promise<TokenResponse>
    // subtractToken(request: TokenRequest): Promise<TokenResponse>
    // getBalance(request: GetBalanceRequest): Promise<GetBalanceResponse>
}
