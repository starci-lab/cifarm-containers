import { Inject, Injectable } from "@nestjs/common"
import { MODULE_OPTIONS_TOKEN } from "./exec.module-definition"
import {
    DockerContainerData,
    DockerContainerProfileRaw,
    DockerContainerRaw,
    ExecOptions
} from "./exec.types"
import { DockerRedisClusterOptions } from "./exec.types"
import { ExecService } from "./exec.service"
import { NatMap } from "ioredis"
import { LOCALHOST } from "@src/env"

@Injectable()
export class ExecDockerRedisClusterService {
    private options: DockerRedisClusterOptions
    private networkName: string
    constructor(
        private readonly execService: ExecService,
        @Inject(MODULE_OPTIONS_TOKEN) private execOptions: ExecOptions
    ) {
        this.options = this.execOptions?.docker?.redisCluster
        this.networkName = this.options?.networkName
    }

    private getNetworkId() {
        return this.execService.execSync(
            `docker network inspect --format '{{.Id}}' ${this.networkName}`
        )
    }

    private getContainers(): Record<string, DockerContainerData> {
        const networkId = this.getNetworkId()
        const networkInfo = this.execService.execSync(`docker network inspect ${networkId}`)
        const containers = JSON.parse(networkInfo)[0].Containers as Record<
            string,
            DockerContainerProfileRaw
        >

        const result: Record<string, DockerContainerData> = {}
        // get container ids
        const containerIds = Object.keys(containers)
        const inspectCommands = `docker inspect ${containerIds.map((id) => id).join(" ")}`
        const inspectResults = this.execService.execSync(inspectCommands)
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
