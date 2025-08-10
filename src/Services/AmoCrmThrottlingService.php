<?php

namespace App\Services;

use Monolog\Logger;

class AmoCrmThrottlingService
{
    private Logger $logger;
    private RedisInterface $redis;
    private int $maxRequestsPerMinute;
    private int $maxRequestsPerHour;
    private string $redisPrefix;

    public function __construct(
        Logger $logger,
        RedisInterface $redis,
        int $maxRequestsPerMinute = 7, // amoCRM default: 7 requests per second
        int $maxRequestsPerHour = 1000, // Conservative hourly limit
        string $redisPrefix = 'amocrm_throttle:'
    ) {
        $this->logger = $logger;
        $this->redis = $redis;
        $this->maxRequestsPerMinute = $maxRequestsPerMinute;
        $this->maxRequestsPerHour = $maxRequestsPerHour;
        $this->redisPrefix = $redisPrefix;
    }

    /**
     * Check if API call is allowed and wait if necessary
     */
    public function throttleApiCall(string $endpoint = 'default'): void
    {
        $minuteKey = $this->redisPrefix . 'minute:' . $endpoint . ':' . $this->getCurrentMinute();
        $hourKey = $this->redisPrefix . 'hour:' . $endpoint . ':' . $this->getCurrentHour();

        // Check minute limit
        $minuteCount = (int)$this->redis->get($minuteKey);
        if ($minuteCount >= $this->maxRequestsPerMinute) {
            $this->logger->warning('amoCRM minute rate limit reached', [
                'endpoint' => $endpoint,
                'current_count' => $minuteCount,
                'limit' => $this->maxRequestsPerMinute
            ]);

            // Calculate wait time until next minute
            $waitTime = $this->calculateWaitTimeForNextMinute();
            $this->logger->info('Waiting for amoCRM rate limit reset', [
                'wait_time_seconds' => $waitTime,
                'endpoint' => $endpoint
            ]);

            sleep($waitTime);
        }

        // Check hour limit
        $hourCount = (int)$this->redis->get($hourKey);
        if ($hourCount >= $this->maxRequestsPerHour) {
            $this->logger->warning('amoCRM hour rate limit reached', [
                'endpoint' => $endpoint,
                'current_count' => $hourCount,
                'limit' => $this->maxRequestsPerHour
            ]);

            // Calculate wait time until next hour
            $waitTime = $this->calculateWaitTimeForNextHour();
            $this->logger->info('Waiting for amoCRM hourly rate limit reset', [
                'wait_time_seconds' => $waitTime,
                'endpoint' => $endpoint
            ]);

            sleep($waitTime);
        }

        // Increment counters
        $this->incrementCounters($minuteKey, $hourKey);

        $this->logger->debug('amoCRM API call throttled successfully', [
            'endpoint' => $endpoint,
            'minute_count' => $minuteCount + 1,
            'hour_count' => $hourCount + 1
        ]);
    }

    /**
     * Get current rate limit status
     */
    public function getRateLimitStatus(string $endpoint = 'default'): array
    {
        $minuteKey = $this->redisPrefix . 'minute:' . $endpoint . ':' . $this->getCurrentMinute();
        $hourKey = $this->redisPrefix . 'hour:' . $endpoint . ':' . $this->getCurrentHour();

        $minuteCount = (int)$this->redis->get($minuteKey);
        $hourCount = (int)$this->redis->get($hourKey);

        return [
            'minute' => [
                'current' => $minuteCount,
                'limit' => $this->maxRequestsPerMinute,
                'remaining' => max(0, $this->maxRequestsPerMinute - $minuteCount),
                'reset_time' => $this->getNextMinuteTimestamp()
            ],
            'hour' => [
                'current' => $hourCount,
                'limit' => $this->maxRequestsPerHour,
                'remaining' => max(0, $this->maxRequestsPerHour - $hourCount),
                'reset_time' => $this->getNextHourTimestamp()
            ]
        ];
    }

    /**
     * Reset rate limit counters (useful for testing)
     */
    public function resetCounters(string $endpoint = 'default'): void
    {
        $minuteKey = $this->redisPrefix . 'minute:' . $endpoint . ':' . $this->getCurrentMinute();
        $hourKey = $this->redisPrefix . 'hour:' . $endpoint . ':' . $this->getCurrentHour();

        $this->redis->del($minuteKey, $hourKey);

        $this->logger->info('amoCRM rate limit counters reset', [
            'endpoint' => $endpoint
        ]);
    }

    private function incrementCounters(string $minuteKey, string $hourKey): void
    {
        $this->redis->multi();
        
        // Increment minute counter with 60-second expiration
        $this->redis->incr($minuteKey);
        $this->redis->expire($minuteKey, 60);
        
        // Increment hour counter with 3600-second expiration
        $this->redis->incr($hourKey);
        $this->redis->expire($hourKey, 3600);
        
        $this->redis->exec();
    }

    private function getCurrentMinute(): string
    {
        return date('Y-m-d-H-i');
    }

    private function getCurrentHour(): string
    {
        return date('Y-m-d-H');
    }

    private function getNextMinuteTimestamp(): int
    {
        return strtotime('+1 minute', strtotime($this->getCurrentMinute()));
    }

    private function getNextHourTimestamp(): int
    {
        return strtotime('+1 hour', strtotime($this->getCurrentHour()));
    }

    private function calculateWaitTimeForNextMinute(): int
    {
        $nextMinute = $this->getNextMinuteTimestamp();
        $waitTime = $nextMinute - time();
        return max(1, $waitTime);
    }

    private function calculateWaitTimeForNextHour(): int
    {
        $nextHour = $this->getNextHourTimestamp();
        $waitTime = $nextHour - time();
        return max(1, $waitTime);
    }
}
