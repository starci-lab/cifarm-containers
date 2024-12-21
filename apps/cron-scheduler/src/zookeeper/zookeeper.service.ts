import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter"
import { envConfig } from "@src/config"
import ZooKeeper from "node-zookeeper-client"

export const ROOT_ZNODE_NAME = "cron-scheduler"
export const LEADER_CHANGED_EVENT = "leader.changed"

@Injectable()
export class ZooKeeperService implements OnModuleInit, OnModuleDestroy {
    private logger = new Logger(ZooKeeperService.name)
    private zk: ZooKeeper.Client


    //private methods to make znode paths
    private makeRootZnodePath = () => `/${ROOT_ZNODE_NAME}`
    private makeEphemeralZnodePath = (name: string) => `${this.makeRootZnodePath()}/${name}`

    // params to define the connection
    // set values to not throw error, but no effect
    private currentZnodeName = "default1"
    private leaderZnodeName = "default2"

    public checkLeader() {
        return this.currentZnodeName === this.leaderZnodeName
    }

    constructor(
        private readonly eventEmitter: EventEmitter2
    ) { }

    //get children of root znode
    private async getChildren () : Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
            this.zk.getChildren(this.makeRootZnodePath(), (error, children) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(children)
                }
            })
        })
    }

    //get children of root znode and emit leader changed event
    private async getChidrenThenEmitLeaderChanged() {
        const children = await this.getChildren()
        const sortedChildren = children.sort()
        const leaderZnodeName = sortedChildren[0]

        this.eventEmitter.emit(LEADER_CHANGED_EVENT, {
            leaderZnodeName
        })
    }

    @OnEvent(LEADER_CHANGED_EVENT)
    handleLeaderChanged(payload: LeaderChangedPayload) {
        this.logger.debug("Leader has changed")
        //set new leader
        this.leaderZnodeName = payload.leaderZnodeName
        
        //watch new leader
        this.logger.fatal(`Watching new leader: ${this.leaderZnodeName}`)
        this.zk.exists(this.makeEphemeralZnodePath(this.leaderZnodeName), async (event) => {
            //if leader is deleted, get children and emit leader changed event
            if (event.getType() === ZooKeeper.Event.NODE_DELETED) {
                this.logger.fatal(`Leader ${this.leaderZnodeName} has been deleted`)
                await this.getChidrenThenEmitLeaderChanged()
            }
        }, (error) => {
            if (error) {
                this.logger.error(`Failed to watch znode: ${error}`)
            }
        })
    }

    onModuleDestroy() {
        console.log("MyModule is being destroyed. Cleaning up resources...")
        this.zk.close()
    }

    onModuleInit() {
        this.connect()
        //create corresponding znode
        this.createRootZnode()
        this.createEphemeralZnode()
        this.registerListeners()
    }

    private async createRootZnode() {
        const zk = this.zk

        zk.exists(this.makeRootZnodePath(), (error, stat) => {
            if (error) {
                this.logger.error(`Failed to check if znode exists: ${error}`)
            } else if (!stat) {
                zk.create(this.makeRootZnodePath(), Buffer.from(""), ZooKeeper.CreateMode.PERSISTENT, (error, path) => {
                    if (error) {
                        this.logger.error(`Failed to create znode: ${error}`)
                    } else {
                        this.logger.debug(`Znode created at path: ${path}`)
                    }
                })
            }
        })
    }

    //private method after connect
    private async registerListeners() {
        this.zk.once("connected", () => {
            this.logger.debug("Connected to Zookeeper")
        })
        this.zk.once("disconnected", () => {
            this.logger.debug("Disconnected from Zookeeper")
        })
        this.zk.once("expired", () => {
            this.connect()
        })
    }

    private async createEphemeralZnode() {
        //create perapheal znode
        this.zk.create(this.makeEphemeralZnodePath("candidate"), Buffer.from(""), ZooKeeper.CreateMode.EPHEMERAL_SEQUENTIAL, async (error, path) => {
            this.currentZnodeName = path.split("/").pop()

            //check if znode was created
            if (error) {
                this.logger.error(`Failed to create znode: ${error}`)
            } else {
                this.logger.debug(`Znode created at path: ${path}`)
            }

            //get children of root znode
            await this.getChidrenThenEmitLeaderChanged()
        })
    }

    private connect() {
        const connectionString = `${envConfig().zookeeper.host}:${envConfig().zookeeper.port}`

        // Create a new Zookeeper client
        this.zk = ZooKeeper.createClient(connectionString)
        this.zk.connect()
    }
}

export interface LeaderChangedPayload {
    leaderZnodeName: string
}