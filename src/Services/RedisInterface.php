<?php

namespace App\Services;

interface RedisInterface
{
    public function get(string $key): ?string;
    public function setex(string $key, int $seconds, string $value): bool;
    public function keys(string $pattern): array;
    public function del(string $key): int;
    public function exists(string $key): int;
    public function ttl(string $key): int;
    public function incr(string $key): int;
    public function mget(array $keys): array;
    public function mset(array $data): bool;
}
