import { Inject, Injectable } from "@nestjs/common"
import { MODULE_OPTIONS_TOKEN } from "./exec.module-definition"
import {
    DockerContainerData,
    DockerContainerProfileRaw,
    DockerContainerRaw,
    ExecOptions,
    DockerRedisClusterOptions
} from "./exec.types"
import { ExecService } from "./exec.service"
import { NatMap } from "ioredis"
import { envConfig, LOCALHOST, RedisType } from "@src/env"

@Injectable()
export class ExecDockerRedisClusterService {
    private readonly options: DockerRedisClusterOptions
    private readonly networkName: string
    constructor(
        private readonly execService: ExecService,
        @Inject(MODULE_OPTIONS_TOKEN) private readonly execOptions: ExecOptions
    ) {
        this.options = this.execOptions?.docker?.redisCluster
        this.networkName =
            envConfig().databases.redis[
                this.options?.type || RedisType.Cache
            ].cluster.dockerNetworkName
    }

    private async getNetworkId() {
        return await this.execService.exec("docker", [
            "network",
            "inspect",
            "--format",
            "'{{.Id}}'",
            this.networkName
        ])
    }

    private async getContainers(): Promise<Record<string, DockerContainerData>> {
        const networkId = await this.getNetworkId()
        const networkInfo = await this.execService.exec("docker", ["network", "inspect", networkId])
        const containers = JSON.parse(networkInfo)[0].Containers as Record<
            string,
            DockerContainerProfileRaw
        >

        const result: Record<string, DockerContainerData> = {}
        // get container ids
        const containerIds = Object.keys(containers)
        const inspectResults = await this.execService.exec("docker", ["inspect", ...containerIds])
        const portBindingsMap: Record<string, { HostPort: string }[]>[] = (
            JSON.parse(inspectResults) as Array<DockerContainerRaw>
        ).map((container) => container["HostConfig"]["PortBindings"])
        // iterate over container ids and get the container data
        containerIds.forEach((id, index) => {
            const container = containers[id]
            const portBindings = portBindingsMap[index]
            const internalPort = Object.keys(portBindings)[0]
            const externalPort = portBindings[internalPort][0]["HostPort"]
            result[id] = {
                name: container["Name"],
                ipV4: container["IPv4Address"].split("/")[0],
                internalPort: Number.parseInt(internalPort.split("/")[0]),
                externalPort: Number.parseInt(externalPort)
            }
        })
        return result
    }

    public getNatMap(): NatMap {
        const containers = this.getContainers()
        return Object.values(containers).reduce((acc, container) => {
            acc[`${container.ipV4}:${container.internalPort}`] = {
                host: LOCALHOST,
                port: container.externalPort
            }
            return acc
        }, {})
    }
}
