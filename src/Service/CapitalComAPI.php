<?php

namespace App\Service;

use GuzzleHttp\Client;

class CapitalComAPI
{
    private $client;
    private $apiKey;
    private $baseUrl;

    public function __construct(string $apiKey, bool $demoMode = true)
    {
        $this->apiKey = $apiKey;
        $this->baseUrl = $demoMode ? 'https://demo-api-capital.backend-capital.com/api/v1/' : 'https://api-capital.backend-capital.com/api/v1/';
        
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'headers' => [
                'X-CAP-API-KEY' => $this->apiKey,
                'Content-Type' => 'application/json'
            ]
        ]);
    }

    public function getMarketData(string $symbol, string $interval = '1h', int $limit = 100)
    {
        $response = $this->client->get("prices/{$symbol}", [
            'query' => [
                'interval' => $interval,
                'limit' => $limit
            ]
        ]);

        return json_decode($response->getBody()->getContents(), true);
    }

    public function placeTrade(string $symbol, string $direction, float $size, array $riskParams = [])
    {
        $payload = [
            'epic' => $symbol,
            'direction' => $direction,
            'size' => $size
        ];

        if (isset($riskParams['stopLoss'])) {
            $payload['stopLevel'] = $riskParams['stopLoss'];
        }

        if (isset($riskParams['takeProfit'])) {
            $payload['profitLevel'] = $riskParams['takeProfit'];
        }

        $response = $this->client->post('positions', [
            'json' => $payload
        ]);

        return json_decode($response->getBody()->getContents(), true);
    }
}