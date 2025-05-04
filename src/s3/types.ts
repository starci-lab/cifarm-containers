import { BaseOptions } from "@src/common"

export enum S3Provider {
    DigitalOcean1 = "digitalocean1",
}

export interface S3Options extends BaseOptions {
    provider?: S3Provider
}

