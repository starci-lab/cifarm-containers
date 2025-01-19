import { RedisType } from "@src/env"

export interface ExecOptions {
    docker?: DockerOptions
}

export interface DockerOptions {
    core?: boolean
    redisCluster?: DockerRedisClusterOptions
}

export interface DockerRedisClusterOptions {
    enabled: boolean
    type?: RedisType
    // custom injected token
    injectionToken?: string
}

export type PortBindingsRaw = Record<string, Array<{ HostPort: string }>>

export interface HostConfigRaw {
    PortBindings: PortBindingsRaw
}

export interface DockerContainerRaw {
    HostConfig: HostConfigRaw
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

export interface ContainerInfo {
    image: string
    dockerfile: string
}