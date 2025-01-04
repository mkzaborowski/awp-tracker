'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// [ticker].js - Place in pages/stock/[ticker].js
const StockDetails = ({params}: {ticker: string}) => {
    const ticker = params.ticker;
    const [stockData, setStockData] = useState(null);
    const [historicalData, setHistoricalData] = useState([]);

    useEffect(() => {
        if (ticker) {
            fetchStockData();
            fetchHistoricalData();
        }
    }, [ticker]);

    const fetchStockData = async () => {
        try {
            const response = await fetch(`/api/stock/${ticker}`);
            const data = await response.json();
            setStockData(data);
        } catch (error) {
            console.error('Error fetching stock data:', error);
        }
    };

    const fetchHistoricalData = async () => {
        try {
            const response = await fetch(`/api/stock/${ticker}/historical`);
            const data = await response.json();
            setHistoricalData(data);
        } catch (error) {
            console.error('Error fetching historical data:', error);
        }
    };

    if (!stockData) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="grid gap-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">{stockData.name} ({ticker})</h1>
                        <p className="text-2xl mt-2">
                            ${stockData.price}
                            <span className={`ml-2 ${stockData.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stockData.change > 0 ? '+' : ''}{stockData.change}%
              </span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Price History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={historicalData}>
                                        <XAxis dataKey="date" />
                                        <YAxis domain={['auto', 'auto']} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="price" stroke="#8884d8" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Key Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Market Cap</span>
                                    <span className="font-medium">${stockData.marketCap}B</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">P/E Ratio</span>
                                    <span className="font-medium">{stockData.peRatio}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">52W High</span>
                                    <span className="font-medium">${stockData.high52w}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">52W Low</span>
                                    <span className="font-medium">${stockData.low52w}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Volume</span>
                                    <span className="font-medium">{stockData.volume.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Dividend Yield</span>
                                    <span className="font-medium">{stockData.dividendYield}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Portfolio Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Your Position</span>
                                    <span className="font-medium">{stockData.shares} shares</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Average Cost</span>
                                    <span className="font-medium">${stockData.avgCost}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Value</span>
                                    <span className="font-medium">${(stockData.shares * stockData.price).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Return</span>
                                    <span className={`font-medium ${stockData.totalReturn > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stockData.totalReturn > 0 ? '+' : ''}{stockData.totalReturn}%
                  </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StockDetails;