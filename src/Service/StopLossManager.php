<?php

namespace App\Service;

class StopLossManager
{
    private const TRAILING_ACTIVATION_THRESHOLD = 0.5; // 50% of take profit reached
    private const TRAILING_STEP = 0.0001; // 1 pip for forex
    private const BREAKEVEN_THRESHOLD = 0.3; // Move to breakeven at 30% of take profit

    public function calculateInitialStops(array $prices, string $direction, float $entryPrice): array
    {
        $atr = $this->calculateATR($prices, 14);
        $volatilityMultiplier = $this->getVolatilityMultiplier($prices);
        
        // Adjust stop loss based on volatility
        $stopDistance = $atr * $volatilityMultiplier;
        
        $stopLoss = $direction === 'buy' 
            ? $entryPrice - $stopDistance
            : $entryPrice + $stopDistance;

        // Calculate take profit based on risk:reward
        $riskAmount = abs($entryPrice - $stopLoss);
        $takeProfit = $direction === 'buy'
            ? $entryPrice + ($riskAmount * 2.5)
            : $entryPrice - ($riskAmount * 2.5);

        return [
            'stop_loss' => $stopLoss,
            'take_profit' => $takeProfit,
            'initial_risk' => $riskAmount,
            'atr' => $atr
        ];
    }

    public function updateTrailingStop(
        array $position,
        float $currentPrice,
        string $direction
    ): ?float {
        $profitAmount = $direction === 'buy'
            ? $currentPrice - $position['entry_price']
            : $position['entry_price'] - $currentPrice;

        $targetProfit = abs($position['take_profit'] - $position['entry_price']);
        $progressToTarget = $profitAmount / $targetProfit;

        // Move to breakeven
        if ($progressToTarget >= self::BREAKEVEN_THRESHOLD) {
            $newStop = $position['entry_price'];
            
            // Activate trailing stop
            if ($progressToTarget >= self::TRAILING_ACTIVATION_THRESHOLD) {
                $trailingDistance = $position['atr'] * 1.5;
                
                $newStop = $direction === 'buy'
                    ? max($currentPrice - $trailingDistance, $newStop)
                    : min($currentPrice + $trailingDistance, $newStop);
            }

            return $newStop;
        }

        return null;
    }

    public function calculateVolatilityStop(array $prices, float $entryPrice, string $direction): float
    {
        $volatility = $this->calculateVolatility($prices, 20);
        $stopDistance = $volatility * 2; // 2 standard deviations

        return $direction === 'buy'
            ? $entryPrice - $stopDistance
            : $entryPrice + $stopDistance;
    }

    private function calculateATR(array $prices, int $period): float
    {
        $trs = [];
        for ($i = 1; $i < count($prices); $i++) {
            $high = $prices[$i]['high'];
            $low = $prices[$i]['low'];
            $prevClose = $prices[$i-1]['close'];
            
            $tr = max(
                $high - $low,
                abs($high - $prevClose),
                abs($low - $prevClose)
            );
            $trs[] = $tr;
        }

        $trs = array_slice($trs, -$period);
        return array_sum($trs) / count($trs);
    }

    private function calculateVolatility(array $prices, int $period): float
    {
        $returns = [];
        for ($i = 1; $i < count($prices); $i++) {
            $returns[] = log($prices[$i]['close'] / $prices[$i-1]['close']);
        }

        $returns = array_slice($returns, -$period);
        $mean = array_sum($returns) / count($returns);
        
        $squaredDiffs = array_map(function($return) use ($mean) {
            return pow($return - $mean, 2);
        }, $returns);

        return sqrt(array_sum($squaredDiffs) / count($squaredDiffs));
    }

    private function getVolatilityMultiplier(array $prices): float
    {
        $volatility = $this->calculateVolatility($prices, 20);
        
        // Adjust multiplier based on market volatility
        if ($volatility > 0.02) { // High volatility
            return 2.0;
        } elseif ($volatility > 0.01) { // Medium volatility
            return 1.5;
        }
        return 1.0; // Low volatility
    }
}