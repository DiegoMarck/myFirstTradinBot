import sys
import json
import numpy as np
from typing import List, Dict

def calculate_moving_averages(prices: List[float], short_period: int = 20, long_period: int = 50) -> Dict:
    short_ma = np.mean(prices[-short_period:])
    long_ma = np.mean(prices[-long_period:])
    return {
        'short_ma': short_ma,
        'long_ma': long_ma,
        'trend': 'bullish' if short_ma > long_ma else 'bearish'
    }

def analyze_candlestick_patterns(candles: List[Dict]) -> Dict:
    # Analyze last 5 candles for patterns
    last_candles = candles[-5:]
    
    # Calculate candle characteristics
    bodies = [abs(c['close'] - c['open']) for c in last_candles]
    wicks = [c['high'] - max(c['open'], c['close']) + min(c['open'], c['close']) - c['low'] for c in last_candles]
    
    # Check for flat candles
    is_flat = np.mean(bodies) < np.mean(wicks) * 0.3
    
    # Simple head and shoulders detection
    if len(last_candles) >= 5:
        highs = [c['high'] for c in last_candles]
        if highs[0] > highs[1] and highs[2] > highs[0] and highs[2] > highs[4] and highs[4] > highs[3]:
            return {'pattern': 'head_and_shoulders', 'signal': 'sell'}
    
    return {
        'is_flat': is_flat,
        'pattern': 'flat' if is_flat else 'normal',
        'signal': 'wait' if is_flat else 'neutral'
    }

def main():
    # Read market data from stdin
    market_data = json.loads(sys.argv[1])
    
    # Extract price data
    closes = [candle['close'] for candle in market_data['prices']]
    
    # Perform analysis
    ma_analysis = calculate_moving_averages(closes)
    pattern_analysis = analyze_candlestick_patterns(market_data['prices'])
    
    # Trading decision logic
    should_trade = False
    direction = 'none'
    position_size = 0.0
    
    if ma_analysis['trend'] == 'bullish' and pattern_analysis['signal'] != 'sell':
        should_trade = True
        direction = 'buy'
        position_size = 0.1  # Standard lot size, adjust based on risk management
    elif ma_analysis['trend'] == 'bearish' and pattern_analysis['signal'] == 'sell':
        should_trade = True
        direction = 'sell'
        position_size = 0.1
    
    # Prepare response
    response = {
        'should_trade': should_trade,
        'direction': direction,
        'position_size': position_size,
        'analysis': {
            'moving_averages': ma_analysis,
            'patterns': pattern_analysis
        }
    }
    
    print(json.dumps(response))

if __name__ == "__main__":
    main()