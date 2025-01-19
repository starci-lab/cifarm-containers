import { OnEvent } from "@nestjs/event-emitter"
import {
    LEADER_ELECTED_EMITTER2_EVENT,
    LEADER_LOST_EMITTER2_EVENT
} from "./leader-election.constant"

export const OnEventLeaderElected = () => OnEvent(LEADER_ELECTED_EMITTER2_EVENT)
export const OnEventLeaderLost = () => OnEvent(LEADER_LOST_EMITTER2_EVENT)
