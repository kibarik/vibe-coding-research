<?php

namespace App\Services;

use Predis\Client;

class PredisAdapter implements RedisInterface
{
    private Client $client;

    public function __construct(Client $client)
    {
        $this->client = $client;
    }

    public function get(string $key): ?string
    {
        $result = $this->client->get($key);
        return $result === null ? null : (string) $result;
    }

    public function setex(string $key, int $seconds, string $value): bool
    {
        $result = $this->client->setex($key, $seconds, $value);
        return $result === 'OK';
    }

    public function keys(string $pattern): array
    {
        $result = $this->client->keys($pattern);
        return is_array($result) ? $result : [];
    }

    public function del(string $key): int
    {
        return (int) $this->client->del($key);
    }

    public function exists(string $key): int
    {
        return (int) $this->client->exists($key);
    }

    public function ttl(string $key): int
    {
        return (int) $this->client->ttl($key);
    }

    public function incr(string $key): int
    {
        return (int) $this->client->incr($key);
    }

    public function mget(array $keys): array
    {
        $result = $this->client->mget($keys);
        return array_map(function($value) {
            return $value === null ? null : (string) $value;
        }, $result);
    }

    public function mset(array $data): bool
    {
        $result = $this->client->mset($data);
        return $result === 'OK';
    }
}
