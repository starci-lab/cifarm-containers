import { CommandRunner, SubCommand, Option } from "nest-commander"
import { Logger } from "@nestjs/common"
import { FarcasterService } from "@src/farcaster"

@SubCommand({ name: "publish-cast", description: "Publish a cast to Farcaster" })
export class PublishCastCommand extends CommandRunner {
    private readonly logger = new Logger(PublishCastCommand.name)

    constructor(
        private readonly farcasterService: FarcasterService
    ) {
        super()
    }

    async run(_: Array<string>, options?: PublishCastCommandOptions): Promise<void> {
        this.logger.debug("Publishing the cast...")
        const { text } = options
        try {
            const { cast } = await this.farcasterService.publishCast({
                text
            })
            this.logger.debug(`Published cast with hash: ${cast.hash}`)
        } catch (error) {
            this.logger.error(`Failed to publish the cast: ${error.message}`)
        }
    }

    @Option({
        flags: "-c, --channel-id <channelId>",
        description: "Channel ID",
        required: false
    })
    parseChannelId(channelId: string): string {
        return channelId
    }

    @Option({
        flags: "-t, --text <text>",
        description: "Text",
        defaultValue: "Hello, world!"
    })
    parseText(text: string): string {
        return text
    }

    @Option({
        flags: "-p, --parent <parent>",
        description: "Parent",
        required: false
    })
    parseParent(parent: string): string {
        return parent
    }

    @Option({
        flags: "-pa, --parent-author-fid <parentAuthorFid>",
        description: "Parent author FID",
        defaultValue: "380599"
    })
    parseParentAuthorFid(parentAuthorFid: number): number {
        return parentAuthorFid
    }

    @Option({
        flags: "-i, --idem <idem>",
        description: "IDEM",
        required: false
    })
    parseIdem(idem: string): string {
        return idem
    }
}

export interface PublishCastCommandOptions {
    channelId?: string
    text: string
    parent?: string
    parentAuthorFid: number
    idem?: string
}
