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
        //check if current path is leader path
        this.logger.debug(`Current znode: ${this.currentZnodeName}`)
        this.logger.debug(`Leader znode: ${this.leaderZnodeName}`)
        return this.currentZnodeName === this.leaderZnodeName
    }

    constructor(
        private readonly eventEmitter: EventEmitter2
    ) { }

    @OnEvent(LEADER_CHANGED_EVENT)
    handleLeaderChanged(payload: LeaderChangedPayload) {
        this.logger.debug("Leader has changed")
        //set new leader
        this.leaderZnodeName = payload.leaderZnodeName
        
        //watch new leader
        this.logger.fatal(`Watching new leader: ${this.leaderZnodeName}`)
        this.zk.exists(this.makeEphemeralZnodePath(this.leaderZnodeName), (event) => {
            
            if (event.getType() === ZooKeeper.Event.NODE_DELETED) {
                this.zk.getChildren(this.makeRootZnodePath(), (error, children) => {
                    if (error) {
                        this.logger.error(`Failed to get children of znode: ${error}`)
                        //mean that leader has changed again, so a callback is needed
                    } else if (children.length)
                    {
                        const sortedChildren = children.sort()
                        const leaderZnodeName = sortedChildren[0]

                        this.eventEmitter.emit(LEADER_CHANGED_EVENT, {
                            leaderZnodeName
                        })
                    }
                })
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
        this.zk.create(this.makeEphemeralZnodePath("candidate"), Buffer.from(""), ZooKeeper.CreateMode.EPHEMERAL_SEQUENTIAL, (error, path) => {
            this.currentZnodeName = path.split("/").pop()

            if (error) {
                this.logger.error(`Failed to create znode: ${error}`)
            } else {
                this.logger.debug(`Znode created at path: ${path}`)
            }

            //get children of root znode
            this.zk.getChildren(this.makeRootZnodePath(), (error, children) => {

                //if error, log error
                if (error) {
                    this.logger.error(`Failed to get children of znode: ${error}`)
                } else if (children.length) {
                    //sort children and get leader path
                    const sortedChildren = children.sort()
                    const leaderZnodeName = sortedChildren[0]
                    this.eventEmitter.emit(LEADER_CHANGED_EVENT, {
                        leaderZnodeName
                    })    
                }
            })
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