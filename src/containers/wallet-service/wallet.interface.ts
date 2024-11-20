import { GetBalanceRequest, GetBalanceResponse } from "@apps/wallet-service/src/balance"
import {
    AddGoldRequest,
    AddGoldResponse,
    GetGoldBalanceRequest,
    GetGoldBalanceResponse,
    SubtractGoldRequest,
    SubtractGoldResponse
} from "@apps/wallet-service/src/gold"
import {
    AddTokenRequest,
    AddTokenResponse,
    GetTokenBalanceRequest,
    GetTokenBalanceResponse,
    SubtractTokenRequest,
    SubtractTokenResponse
} from "@apps/wallet-service/src/token"
import { Observable } from "rxjs"

export interface IWalletService {
    getGoldBalance(request: GetGoldBalanceRequest): Observable<GetGoldBalanceResponse>
    addGold(request: AddGoldRequest): Observable<AddGoldResponse>
    subtractGold(request: SubtractGoldRequest): Observable<SubtractGoldResponse>
    getTokenBalance(request: GetTokenBalanceRequest): Observable<GetTokenBalanceResponse>
    addToken(request: AddTokenRequest): Observable<AddTokenResponse>
    subtractToken(request: SubtractTokenRequest): Observable<SubtractTokenResponse>
    getBalance(request: GetBalanceRequest): Observable<GetBalanceResponse>
}
