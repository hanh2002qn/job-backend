// Queue name constants
export const QUEUES = {
  CRAWLER: 'crawler',
  CRAWLER_DETAIL: 'crawler-detail',
  EMAIL: 'email',
  NOTIFICATION: 'notification',
  ANALYTICS: 'analytics',
} as const;

// Job type constants
export const JOB_TYPES = {
  // Crawler jobs
  CRAWL_TOPCV: 'crawl-topcv',
  CRAWL_LINKEDIN: 'crawl-linkedin',
  CRAWL_VIETNAMWORKS: 'crawl-vietnamworks',
  FETCH_JOB_DETAIL: 'fetch-job-detail',

  // Email jobs
  SEND_REMINDER: 'send-reminder',
  SEND_JOB_ALERT: 'send-job-alert',
  SEND_WELCOME: 'send-welcome',

  // Notification jobs
  PUSH_NOTIFICATION: 'push-notification',

  // Analytics jobs
  UPDATE_STATS: 'update-stats',
} as const;

// Cache key prefixes
export const CACHE_KEYS = {
  JOBS_LIST: 'jobs:list',
  JOB_DETAIL: 'job',
  MATCHING: 'matching',
  USER_STATS: 'user:stats',
  PROFILE: 'profile',
} as const;

// Cache TTL in seconds
export const CACHE_TTL = {
  JOBS_LIST: 300, // 5 minutes
  JOB_DETAIL: 1800, // 30 minutes
  MATCHING: 3600, // 1 hour
  USER_STATS: 600, // 10 minutes
  PROFILE: 1800, // 30 minutes
} as const;

// Types
export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];
export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];
