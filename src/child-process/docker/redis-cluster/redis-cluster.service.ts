import { Inject, Injectable } from "@nestjs/common"
import { CHILD_PROCESS_DOCKER_REDIS_CLUSTER_OPTIONS } from "./redis-cluster.constants"
import { ChildProcessDockerRedisClusterOptions, DockerContainerData, DockerContainerProfileRaw } from "./redis-cluster.types"
import { ChildProcessService } from "../../base"
import { CacheMemoryService } from "@src/cache"
import { Cache } from "cache-manager"
import { NatMap } from "ioredis"
import { envConfig, RedisType } from "@src/env"
import { NodeAddressMap } from "@redis/client/dist/lib/cluster/cluster-slots"
import { LOCALHOST } from "@src/common"

@Injectable()
export class ChildProcessDockerRedisClusterService {
    // default options
    private networkName: string

    private cache: Cache
    private type: RedisType
    constructor(
        private readonly childProcessService: ChildProcessService,
        private readonly cacheMemoryService: CacheMemoryService,
        @Inject(CHILD_PROCESS_DOCKER_REDIS_CLUSTER_OPTIONS)
        private readonly options?: ChildProcessDockerRedisClusterOptions,
    ) {
        this.cache = this.cacheMemoryService.getCacheManager()
        this.type = options?.type || RedisType.Cache
        this.networkName = envConfig().databases.redis[this.type].cluster.dockerNetworkName
    }

    private async getNetworkId(cache: boolean = true): Promise<string> {
        const cacheKey = "network-id"
        if (cache) {
            const cached = await this.cache.get<string>(cacheKey)
            if (cached) {
                return cached
            }
        }

        const result = await this.childProcessService.execAsync(
            `docker network inspect --format '{{.Id}}' ${this.networkName}`
        )
        await this.cache.set(cacheKey, result)
        return result
    }

    private async getContainers(cache: boolean = true): Promise<Record<string, DockerContainerData>> {
        const networkId = await this.getNetworkId()
        // cache the result
        const cacheKey = `redis-cluster-containers-${networkId}`
        if (cache) {
            const cached = await this.cache.get<Record<string, DockerContainerData>>(cacheKey)
            if (cached) {
                return cached
            }
        }

        const networkInfo = await this.childProcessService.execAsync(`docker network inspect ${networkId}`)
        const containers = JSON.parse(networkInfo)[0].Containers as Record<string, DockerContainerProfileRaw>
        
        const result : Record<string, DockerContainerData> = {}
        // get container ids
        const containerIds = Object.keys(containers)
        const inspectCommands = `docker inspect ${containerIds.map(id => id).join(" ")}`
        const inspectResults = await this.childProcessService.execAsync(inspectCommands)
        const portBindingsMap = JSON.parse(inspectResults).map((container) => container["HostConfig"]["PortBindings"])
        containerIds.forEach((id, index) => {
            const container = containers[id]
            const portBindings = portBindingsMap[index]
            const internalPort = Object.keys(portBindings)[0]
            const externalPort = portBindings[internalPort][0]["HostPort"]
            result[id] = {
                name: container["Name"],
                ipV4: container["IPv4Address"].split("/")[0],
                internalPort: parseInt(internalPort.split("/")[0]),
                externalPort: parseInt(externalPort)
            }
        })

        // cache the result
        await this.cache.set(cacheKey, result)
        return result
    }

    //for ioRedis
    // local purpose only, product we use service discovery
    public async getNatMap(): Promise<NatMap> {
        const containers = await this.getContainers()
        return Object.values(containers).reduce((acc, container) => {
            acc[`${container.ipV4}:${container.internalPort}`] = {
                host: LOCALHOST,
                port: container.externalPort
            }
            return acc
        }, {})
    }

    // for keyv typesave
    // local purpose only, product we use service discovery
    public async getNodeAddressMap(): Promise<NodeAddressMap> {
        const containers = await this.getContainers()
        return Object.values(containers).reduce((acc, container) => {
            acc[`${container.ipV4}:${container.internalPort}`] = {
                host: LOCALHOST,
                port: container.externalPort
            }
            return acc
        }, {})
    }
}