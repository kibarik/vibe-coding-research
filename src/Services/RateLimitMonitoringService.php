<?php

namespace App\Services;

use Monolog\Logger;
use Predis\Client as RedisClient;

class RateLimitMonitoringService
{
    private Logger $logger;
    private RedisClient $redis;
    private string $rateLimitPrefix;
    private string $throttlePrefix;

    public function __construct(
        Logger $logger,
        RedisClient $redis,
        string $rateLimitPrefix = 'rate_limit:',
        string $throttlePrefix = 'amocrm_throttle:'
    ) {
        $this->logger = $logger;
        $this->redis = $redis;
        $this->rateLimitPrefix = $rateLimitPrefix;
        $this->throttlePrefix = $throttlePrefix;
    }

    /**
     * Get comprehensive rate limit metrics
     */
    public function getRateLimitMetrics(): array
    {
        $rateLimitKeys = $this->redis->keys($this->rateLimitPrefix . '*');
        $throttleKeys = $this->redis->keys($this->throttlePrefix . '*');

        $metrics = [
            'summary' => [
                'total_rate_limit_keys' => count($rateLimitKeys),
                'total_throttle_keys' => count($throttleKeys),
                'total_active_limits' => count($rateLimitKeys) + count($throttleKeys),
                'timestamp' => date('c')
            ],
            'rate_limits' => $this->analyzeRateLimitKeys($rateLimitKeys),
            'throttles' => $this->analyzeThrottleKeys($throttleKeys),
            'top_violators' => $this->getTopViolators($rateLimitKeys),
            'health_status' => $this->getHealthStatus($rateLimitKeys, $throttleKeys)
        ];

        return $metrics;
    }

    /**
     * Get rate limit status for a specific client
     */
    public function getClientStatus(string $clientId): array
    {
        $rateLimitKey = $this->rateLimitPrefix . $clientId;
        $throttleKey = $this->throttlePrefix . $clientId;

        $rateLimitData = $this->redis->get($rateLimitKey);
        $throttleData = $this->redis->get($throttleKey);

        $status = [
            'client_id' => $this->maskClientId($clientId),
            'rate_limit' => [
                'active' => $rateLimitData !== null,
                'current_count' => (int)$rateLimitData,
                'ttl' => $this->redis->ttl($rateLimitKey)
            ],
            'throttle' => [
                'active' => $throttleData !== null,
                'current_count' => (int)$throttleData,
                'ttl' => $this->redis->ttl($throttleKey)
            ],
            'recommendations' => $this->getClientRecommendations($clientId, $rateLimitData, $throttleData)
        ];

        return $status;
    }

    /**
     * Get automatic backoff suggestions for clients
     */
    public function getBackoffSuggestions(string $clientId): array
    {
        $rateLimitKey = $this->rateLimitPrefix . $clientId;
        $currentCount = (int)$this->redis->get($rateLimitKey);
        $ttl = $this->redis->ttl($rateLimitKey);

        $suggestions = [
            'client_id' => $this->maskClientId($clientId),
            'current_status' => [
                'requests_made' => $currentCount,
                'time_until_reset' => $ttl,
                'is_limited' => $currentCount >= 100 // Assuming 100 is the limit
            ],
            'recommendations' => []
        ];

        if ($currentCount >= 80) {
            $suggestions['recommendations'][] = [
                'type' => 'warning',
                'message' => 'Approaching rate limit. Consider reducing request frequency.',
                'action' => 'Increase delay between requests to 2-5 seconds'
            ];
        }

        if ($currentCount >= 100) {
            $suggestions['recommendations'][] = [
                'type' => 'critical',
                'message' => 'Rate limit exceeded. Implement exponential backoff.',
                'action' => "Wait {$ttl} seconds before making new requests",
                'backoff_strategy' => [
                    'initial_delay' => $ttl,
                    'max_delay' => 3600,
                    'multiplier' => 2
                ]
            ];
        }

        if ($currentCount >= 150) {
            $suggestions['recommendations'][] = [
                'type' => 'emergency',
                'message' => 'Severe rate limit violation. Implement circuit breaker pattern.',
                'action' => 'Stop all requests for 1 hour and implement proper rate limiting'
            ];
        }

        return $suggestions;
    }

    /**
     * Get health check data for monitoring systems
     */
    public function getHealthCheckData(): array
    {
        $rateLimitKeys = $this->redis->keys($this->rateLimitPrefix . '*');
        $throttleKeys = $this->redis->keys($this->throttlePrefix . '*');

        $totalKeys = count($rateLimitKeys) + count($throttleKeys);
        $criticalViolations = $this->countCriticalViolations($rateLimitKeys);

        $health = [
            'status' => $this->determineHealthStatus($totalKeys, $criticalViolations),
            'metrics' => [
                'total_active_limits' => $totalKeys,
                'critical_violations' => $criticalViolations,
                'rate_limit_keys' => count($rateLimitKeys),
                'throttle_keys' => count($throttleKeys)
            ],
            'alerts' => $this->generateAlerts($totalKeys, $criticalViolations),
            'timestamp' => date('c')
        ];

        return $health;
    }

    /**
     * Clear monitoring data for testing or maintenance
     */
    public function clearMonitoringData(): array
    {
        $rateLimitKeys = $this->redis->keys($this->rateLimitPrefix . '*');
        $throttleKeys = $this->redis->keys($this->throttlePrefix . '*');

        $cleared = [
            'rate_limit_keys' => count($rateLimitKeys),
            'throttle_keys' => count($throttleKeys)
        ];

        if (!empty($rateLimitKeys)) {
            $this->redis->del($rateLimitKeys);
        }

        if (!empty($throttleKeys)) {
            $this->redis->del($throttleKeys);
        }

        $this->logger->info('Rate limit monitoring data cleared', $cleared);

        return $cleared;
    }

    private function analyzeRateLimitKeys(array $keys): array
    {
        $analysis = [
            'total_keys' => count($keys),
            'by_type' => [
                'ip_based' => 0,
                'api_key_based' => 0,
                'unknown' => 0
            ],
            'usage_distribution' => [
                'low' => 0,    // 0-25% of limit
                'medium' => 0, // 26-75% of limit
                'high' => 0,   // 76-99% of limit
                'exceeded' => 0 // 100%+ of limit
            ]
        ];

        foreach ($keys as $key) {
            $clientId = str_replace($this->rateLimitPrefix, '', $key);
            $count = (int)$this->redis->get($key);

            // Categorize by type
            if (strpos($clientId, 'ip:') === 0) {
                $analysis['by_type']['ip_based']++;
            } elseif (strpos($clientId, 'api_key:') === 0) {
                $analysis['by_type']['api_key_based']++;
            } else {
                $analysis['by_type']['unknown']++;
            }

            // Categorize by usage
            if ($count <= 25) {
                $analysis['usage_distribution']['low']++;
            } elseif ($count <= 75) {
                $analysis['usage_distribution']['medium']++;
            } elseif ($count < 100) {
                $analysis['usage_distribution']['high']++;
            } else {
                $analysis['usage_distribution']['exceeded']++;
            }
        }

        return $analysis;
    }

    private function analyzeThrottleKeys(array $keys): array
    {
        $analysis = [
            'total_keys' => count($keys),
            'by_endpoint' => [],
            'by_time_window' => [
                'minute' => 0,
                'hour' => 0
            ]
        ];

        foreach ($keys as $key) {
            $parts = explode(':', $key);
            if (count($parts) >= 3) {
                $timeWindow = $parts[1]; // minute or hour
                $endpoint = $parts[2] ?? 'unknown';

                $analysis['by_time_window'][$timeWindow]++;
                $analysis['by_endpoint'][$endpoint] = ($analysis['by_endpoint'][$endpoint] ?? 0) + 1;
            }
        }

        return $analysis;
    }

    private function getTopViolators(array $keys): array
    {
        $violators = [];

        foreach ($keys as $key) {
            $clientId = str_replace($this->rateLimitPrefix, '', $key);
            $count = (int)$this->redis->get($key);

            if ($count >= 80) { // Only include significant violators
                $violators[] = [
                    'client_id' => $this->maskClientId($clientId),
                    'request_count' => $count,
                    'ttl' => $this->redis->ttl($key),
                    'severity' => $count >= 100 ? 'critical' : 'warning'
                ];
            }
        }

        // Sort by request count descending
        usort($violators, function($a, $b) {
            return $b['request_count'] - $a['request_count'];
        });

        return array_slice($violators, 0, 10); // Top 10 violators
    }

    private function getHealthStatus(array $rateLimitKeys, array $throttleKeys): array
    {
        $totalKeys = count($rateLimitKeys) + count($throttleKeys);
        $criticalViolations = $this->countCriticalViolations($rateLimitKeys);

        return [
            'status' => $this->determineHealthStatus($totalKeys, $criticalViolations),
            'total_active_limits' => $totalKeys,
            'critical_violations' => $criticalViolations,
            'last_updated' => date('c')
        ];
    }

    private function countCriticalViolations(array $keys): int
    {
        $critical = 0;
        foreach ($keys as $key) {
            $count = (int)$this->redis->get($key);
            if ($count >= 100) { // Assuming 100 is the critical threshold
                $critical++;
            }
        }
        return $critical;
    }

    private function determineHealthStatus(int $totalKeys, int $criticalViolations): string
    {
        if ($criticalViolations > 10) {
            return 'critical';
        } elseif ($criticalViolations > 5) {
            return 'warning';
        } elseif ($totalKeys > 1000) {
            return 'warning';
        } else {
            return 'healthy';
        }
    }

    private function generateAlerts(int $totalKeys, int $criticalViolations): array
    {
        $alerts = [];

        if ($criticalViolations > 10) {
            $alerts[] = [
                'level' => 'critical',
                'message' => 'High number of critical rate limit violations',
                'count' => $criticalViolations
            ];
        }

        if ($totalKeys > 1000) {
            $alerts[] = [
                'level' => 'warning',
                'message' => 'High number of active rate limits',
                'count' => $totalKeys
            ];
        }

        return $alerts;
    }

    private function getClientRecommendations(string $clientId, $rateLimitData, $throttleData): array
    {
        $recommendations = [];

        if ($rateLimitData !== null) {
            $count = (int)$rateLimitData;
            if ($count >= 80) {
                $recommendations[] = 'Consider implementing request queuing';
            }
            if ($count >= 100) {
                $recommendations[] = 'Implement exponential backoff strategy';
            }
        }

        if ($throttleData !== null) {
            $recommendations[] = 'amoCRM API throttling is active - consider batching requests';
        }

        return $recommendations;
    }

    private function maskClientId(string $clientId): string
    {
        if (strpos($clientId, 'api_key:') === 0) {
            $key = substr($clientId, 8);
            if (strlen($key) <= 8) {
                return 'api_key:' . str_repeat('*', strlen($key));
            }
            return 'api_key:' . substr($key, 0, 4) . str_repeat('*', strlen($key) - 8) . substr($key, -4);
        }

        if (strpos($clientId, 'ip:') === 0) {
            $ip = substr($clientId, 3);
            return 'ip:' . $this->maskIpAddress($ip);
        }

        return str_repeat('*', strlen($clientId));
    }

    private function maskIpAddress(string $ip): string
    {
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $parts = explode('.', $ip);
            return $parts[0] . '.' . $parts[1] . '.*.*';
        }

        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            $parts = explode(':', $ip);
            return $parts[0] . ':' . $parts[1] . ':*:*:*:*:*:*';
        }

        return 'unknown';
    }
}
