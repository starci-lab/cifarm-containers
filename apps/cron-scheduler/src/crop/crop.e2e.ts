// in order to speed up the cache, we will use the CRON_SCHEDULER_CACHE_SPEED_UP cache key, 
// after it is the object { time: number }
// where time is the time in seconds to grow the crop
export const CROP_CACHE_SPEED_UP = "CRON_SCHEDULER_CROP_CACHE_SPEED_UP"

export interface CropCacheSpeedUpData {
    time: number
}