// in order to speed up the cache, we will use the CRON_SCHEDULER_CACHE_SPEED_UP cache key, 
// after it is the object { time: number }
// where time is the time in seconds to grow the crop
export const BEE_HOUSE_CACHE_SPEED_UP = "CRON_SCHEDULER_BEE_HOUSE_CACHE_SPEED_UP"

export interface BeeHouseCacheSpeedUpData {
    time: number
}