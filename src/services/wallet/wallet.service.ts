import { BalanceResponse, GoldRequest, TokenRequest, UpdateWalletResponse } from "@apps/wallet-service/src/update-wallet"
import { UserIdRequest } from "@src/types"
import { Observable } from "rxjs"

export interface IWalletService {
    getBalance(request: UserIdRequest): Observable<BalanceResponse>
    addGold(request: GoldRequest): Observable<UpdateWalletResponse>
    subtractGold(request: GoldRequest): Observable<UpdateWalletResponse>
    addToken(request: TokenRequest): Observable<UpdateWalletResponse>
    subtractToken(request: TokenRequest): Observable<UpdateWalletResponse>
}