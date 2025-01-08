import { BaseOptions } from "@src/common"
import { RedisType } from "@src/env"

export interface ExecOptions extends BaseOptions {
    docker?: DockerOptions
}

export interface DockerOptions {
    redisCluster?: DockerRedisClusterOptions
}

export interface DockerRedisClusterOptions {
    type?: RedisType
}

export interface DockerContainerRaw {
    HostConfig: { PortBindings: Record<string, { HostPort: string }[]> }
}

export interface DockerContainerProfileRaw {
    Name: string
    EndpointID: string
    MacAddress: string
    IPv4Address: string
    IPv6Address: string
}

export interface DockerContainerData {
    name: string
    ipV4: string
    internalPort: number
    externalPort: number
}
