import { RedisType } from "@src/env"

export interface ChildProcessDockerRedisClusterOptions {
    type?: RedisType
}

export interface DockerContainerProfileRaw {
    "Name": string
    "EndpointID": string
    "MacAddress": string
    "IPv4Address": string
    "IPv6Address": string
}

export interface DockerContainerData {
    name: string
    ipV4: string
    internalPort: number
    externalPort: number
}
