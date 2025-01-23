// in order to speed up the cache, we will use the CRON_SCHEDULER_CACHE_SPEED_UP cache key, 
// after it is the object { time: number }
// where time is the time in seconds to increase the energy
export const ENERGY_CACHE_SPEED_UP = "CRON_SCHEDULER_ENERGY_CACHE_SPEED_UP"

export interface EnergyCacheSpeedUpData {
    time: number
}