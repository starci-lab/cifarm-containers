import {
    AddTokenRequest,
    AddTokenResponse,
    GetTokenBalanceRequest,
    GetTokenBalanceResponse,
    SubtractTokenRequest,
    SubtractTokenResponse,
    AddGoldRequest,
    AddGoldResponse,
    GetGoldBalanceRequest,
    GetGoldBalanceResponse,
    SubtractGoldRequest,
    SubtractGoldResponse,
    GetBalanceRequest,
    GetBalanceResponse
} from "@src/services/gameplay/wallet/"
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
