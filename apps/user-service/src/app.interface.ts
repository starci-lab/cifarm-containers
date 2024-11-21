import { Observable } from "rxjs"
import {
    GetGoldBalanceRequest,
    GetGoldBalanceResponse,
    AddGoldRequest,
    AddGoldResponse,
    SubtractGoldRequest,
    SubtractGoldResponse,
    GetTokenBalanceRequest,
    GetTokenBalanceResponse,
    AddTokenRequest,
    AddTokenResponse,
    SubtractTokenRequest,
    SubtractTokenResponse,
    GetBalanceRequest,
    GetBalanceResponse
} from "./wallet"
import {
    AddExperiencesRequest,
    AddExperiencesResponse,
    GetLevelRequest,
    GetLevelResponse
} from "./level"

export interface IUserService {
    getGoldBalance(request: GetGoldBalanceRequest): Observable<GetGoldBalanceResponse>
    addGold(request: AddGoldRequest): Observable<AddGoldResponse>
    subtractGold(request: SubtractGoldRequest): Observable<SubtractGoldResponse>
    getTokenBalance(request: GetTokenBalanceRequest): Observable<GetTokenBalanceResponse>
    addToken(request: AddTokenRequest): Observable<AddTokenResponse>
    subtractToken(request: SubtractTokenRequest): Observable<SubtractTokenResponse>
    getBalance(request: GetBalanceRequest): Observable<GetBalanceResponse>
    getLevel(request: GetLevelRequest): Observable<GetLevelResponse>
    addExperiences(request: AddExperiencesRequest): Observable<AddExperiencesResponse>
}
