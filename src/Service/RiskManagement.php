<?php

namespace App\Service;

class RiskManagement
{
    private float $accountBalance;
    private float $maxRiskPerTrade; // Percentage
    private float $minRiskRewardRatio;
    private float $maxPositionsOpen;
    private array $openPositions;

    public function __construct(
        float $accountBalance,
        float $maxRiskPerTrade = 0.02, // 2% max risk per trade
        float $minRiskRewardRatio = 2.0, // Minimum 2:1 reward-to-risk ratio
        float $maxPositionsOpen = 3
    ) {
        $this->accountBalance = $accountBalance;
        $this->maxRiskPerTrade = $maxRiskPerTrade;
        $this->minRiskRewardRatio = $minRiskRewardRatio;
        $this->maxPositionsOpen = $maxPositionsOpen;
        $this->openPositions = [];
    }

    public function calculatePositionSize(
        float $entryPrice,
        float $stopLoss,
        string $symbol
    ): array {
        // Check if we can open new positions
        if (count($this->openPositions) >= $this->maxPositionsOpen) {
            return [
                'can_trade' => false,
                'reason' => 'Maximum positions reached',
                'size' => 0
            ];
        }

        // Calculate risk amount in account currency
        $maxRiskAmount = $this->accountBalance * $this->maxRiskPerTrade;
        
        // Calculate pip value and position size
        $pipRisk = abs($entryPrice - $stopLoss);
        $positionSize = $maxRiskAmount / $pipRisk;

        // Round position size to standard lot sizes (0.01 lots)
        $positionSize = round($positionSize * 100) / 100;
        
        // Minimum position size check
        if ($positionSize < 0.01) {
            return [
                'can_trade' => false,
                'reason' => 'Position size too small',
                'size' => 0
            ];
        }

        return [
            'can_trade' => true,
            'size' => $positionSize,
            'max_risk_amount' => $maxRiskAmount,
            'pip_risk' => $pipRisk
        ];
    }

    public function validateTrade(
        float $entryPrice,
        float $stopLoss,
        float $takeProfit
    ): array {
        $riskAmount = abs($entryPrice - $stopLoss);
        $rewardAmount = abs($takeProfit - $entryPrice);
        $riskRewardRatio = $rewardAmount / $riskAmount;

        if ($riskRewardRatio < $this->minRiskRewardRatio) {
            return [
                'valid' => false,
                'reason' => 'Risk-reward ratio below minimum',
                'current_ratio' => $riskRewardRatio
            ];
        }

        return [
            'valid' => true,
            'risk_reward_ratio' => $riskRewardRatio
        ];
    }

    public function addPosition(string $symbol, array $positionDetails): void
    {
        $this->openPositions[$symbol] = $positionDetails;
    }

    public function removePosition(string $symbol): void
    {
        unset($this->openPositions[$symbol]);
    }

    public function calculateDrawdown(): float
    {
        $totalRisk = 0;
        foreach ($this->openPositions as $position) {
            $totalRisk += $position['risk_amount'];
        }
        return ($totalRisk / $this->accountBalance) * 100;
    }
}