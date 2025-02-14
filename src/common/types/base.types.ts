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

export interface BaseOptionsOptions<TOptions> extends BaseOptions {
    options?: TOptions
}

export interface BaseOptions {
    injectionToken?: string
    useGlobalImports?: boolean
}

export interface ClassLike {
    name: string
}

export type DeepPartial<T> = T | (T extends Array<infer U> ? DeepPartial<U>[] : T extends Map<infer K, infer V> ? Map<DeepPartial<K>, DeepPartial<V>> : T extends Set<infer M> ? Set<DeepPartial<M>> : T extends object ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : T);

export interface InterceptorResponse<T> {
    data: T;
}