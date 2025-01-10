export type Empty = Record<string, never>

export interface HttpResponse<TData = undefined> {
    message: string
    data?: TData
}

export interface TransactionResult {
    transactionHash: string
}

export interface TransactionHttpResponseData {
    transactionHash: string
}

export type Atomic = string | number | boolean | object

export interface BaseOptionsOptions<TOptions> {
    options?: TOptions
    injectionToken?: string
}

export interface IInjectionToken {
    injectionToken: string
}