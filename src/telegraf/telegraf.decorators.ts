import { Inject } from "@nestjs/common"
import { TELEGRAF } from "./telegraf.constants"

export const InjectTelegraf = () => Inject(TELEGRAF)