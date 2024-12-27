<?php

namespace App\Service;

use Symfony\Component\Process\Process;

class TradingStrategy
{
    private $pythonPath;

    public function __construct(string $pythonPath)
    {
        $this->pythonPath = $pythonPath;
    }

    public function analyzeMarket(array $marketData): array
    {
        $process = new Process([
            $this->pythonPath,
            __DIR__ . '/../../python/analyze_market.py',
            json_encode($marketData)
        ]);

        $process->run();

        if (!$process->isSuccessful()) {
            throw new \RuntimeException($process->getErrorOutput());
        }

        return json_decode($process->getOutput(), true);
    }
}