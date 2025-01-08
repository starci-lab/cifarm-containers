import { RedisType } from "@src/env"

export interface ExecOptions {
    docker?: DockerOptions
}

export interface DockerOptions {
    redisCluster?: DockerRedisClusterOptions
}

export interface DockerRedisClusterOptions {
    type?: RedisType
    // custom injected token
    injectionToken?: string
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
