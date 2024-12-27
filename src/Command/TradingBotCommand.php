<?php

namespace App\Command;

use App\Service\CapitalComAPI;
use App\Service\TradingStrategy;
use App\Service\RiskManagement;
use App\Service\StopLossManager;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class TradingBotCommand extends Command
{
    private $api;
    private $strategy;
    private $riskManager;
    private $stopLossManager;

    public function __construct(
        CapitalComAPI $api, 
        TradingStrategy $strategy,
        RiskManagement $riskManager,
        StopLossManager $stopLossManager
    ) {
        parent::__construct();
        $this->api = $api;
        $this->strategy = $strategy;
        $this->riskManager = $riskManager;
        $this->stopLossManager = $stopLossManager;
    }

    protected function configure()
    {
        $this->setName('app:trading-bot')
            ->setDescription('Runs the trading bot');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $symbols = ['EUR/USD', 'GBP/USD', 'BTC/USD'];

        foreach ($symbols as $symbol) {
            try {
                $this->processTrade($symbol, $output);
                $this->updateExistingPositions($symbol, $output);
            } catch (\Exception $e) {
                $output->writeln(sprintf('Error processing %s: %s', $symbol, $e->getMessage()));
            }
        }

        return Command::SUCCESS;
    }

    private function processTrade(string $symbol, OutputInterface $output): void
    {
        $marketData = $this->api->getMarketData($symbol);
        $analysis = $this->strategy->analyzeMarket($marketData);

        if (!$analysis['should_trade']) {
            return;
        }

        $entryPrice = $marketData['prices'][count($marketData['prices']) - 1]['close'];
        
        // Calculate stops using the new StopLossManager
        $stops = $this->stopLossManager->calculateInitialStops(
            $marketData['prices'],
            $analysis['direction'],
            $entryPrice
        );

        // Validate trade based on risk/reward
        $tradeValidation = $this->riskManager->validateTrade(
            $entryPrice,
            $stops['stop_loss'],
            $stops['take_profit']
        );
        
        if (!$tradeValidation['valid']) {
            $output->writeln(sprintf(
                'Trade rejected for %s: %s',
                $symbol,
                $tradeValidation['reason']
            ));
            return;
        }

        // Calculate position size
        $positionCalc = $this->riskManager->calculatePositionSize(
            $entryPrice,
            $stops['stop_loss'],
            $symbol
        );
        
        if (!$positionCalc['can_trade']) {
            $output->writeln(sprintf(
                'Position calculation failed for %s: %s',
                $symbol,
                $positionCalc['reason']
            ));
            return;
        }

        // Place the trade with advanced stop management
        $tradeResult = $this->api->placeTrade(
            $symbol,
            $analysis['direction'],
            $positionCalc['size'],
            [
                'stopLoss' => $stops['stop_loss'],
                'takeProfit' => $stops['take_profit'],
                'trailingStop' => true,
                'trailingStopDistance' => $stops['atr'] * 1.5
            ]
        );

        if ($tradeResult['success']) {
            $this->riskManager->addPosition($symbol, [
                'entry_price' => $entryPrice,
                'stop_loss' => $stops['stop_loss'],
                'take_profit' => $stops['take_profit'],
                'risk_amount' => $positionCalc['max_risk_amount'],
                'position_size' => $positionCalc['size'],
                'direction' => $analysis['direction'],
                'atr' => $stops['atr']
            ]);

            $output->writeln(sprintf(
                'Placed %s trade for %s with size %f, SL: %f, TP: %f',
                $analysis['direction'],
                $symbol,
                $positionCalc['size'],
                $stops['stop_loss'],
                $stops['take_profit']
            ));
        }
    }

    private function updateExistingPositions(string $symbol, OutputInterface $output): void
    {
        $positions = $this->riskManager->getPositions();
        if (!isset($positions[$symbol])) {
            return;
        }

        $currentPrice = $this->api->getCurrentPrice($symbol);
        $position = $positions[$symbol];

        $newStopLoss = $this->stopLossManager->updateTrailingStop(
            $position,
            $currentPrice,
            $position['direction']
        );

        if ($newStopLoss !== null && $newStopLoss !== $position['stop_loss']) {
            $this->api->updateStopLoss($symbol, $newStopLoss);
            $position['stop_loss'] = $newStopLoss;
            $this->riskManager->updatePosition($symbol, $position);

            $output->writeln(sprintf(
                'Updated stop loss for %s to %f',
                $symbol,
                $newStopLoss
            ));
        }
    }
}