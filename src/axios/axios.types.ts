// File: axios.types.ts

export interface AxiosOptions {
    baseUrl?: string;
    apiVersion?: ApiVersion;
}

export enum ApiVersion {
    V1 = "v1",
    V2 = "v2",
}