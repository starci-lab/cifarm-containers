import { GoldBalanceResponse, GoldRequest, GoldResponse, TokenRequest } from "@apps/gold-wallet-service/src/update-gold-wallet"
import { UserIdRequest } from "@src/types"
import { Observable } from "rxjs"

export interface IGoldWalletService {
    getGoldBalance(request: UserIdRequest): Observable<GoldBalanceResponse>
    addGold(request: GoldRequest): Observable<GoldResponse>
    subtractGold(request: GoldRequest): Observable<GoldResponse>
}

export interface ITokenWalletService {
    // getTokenBalance(request: UserIdRequest): Observable<TokenBal>
    // addToken(request: TokenRequest): Observable<GoldResponse>
}