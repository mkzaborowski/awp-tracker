'use client';

import { useState, useEffect } from 'react';
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const chartConfig = {
    section1: {
        label: "Section 1",
        color: "#2563eb",
    },
    section4: {
        label: "Section 4",
        color: "#60a5fa",
    },
    section5: {
        label: "Section 5",
        color: "#34d399",
    },
    section6: {
        label: "Section 6",
        color: "#fbbf24",
    },
    section7: {
        label: "Section 7",
        color: "#f87171",
    },
} satisfies ChartConfig;

interface SectionData {
    [key: string]: number;
}

interface ChartData {
    date: string;
    data: SectionData;
}

interface StockEntry {
    Shares: number;
    Ticker: string;
    Company: string;
    "TT Score": number;
    "Gain/Loss": number;
    "Day Chng %": number;
    "% Gain/loss ": number;
    "Price change": number;
    "Current price": number;
    "Adds in quarter": string;
    "Price at start/add ": number;
    "% of portfolio assets": number;
    "Starting position + adds": number;
    "Current position + adds/sales": number;
}

const StateGraph = () => {
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [timeRange, setTimeRange] = useState("90d")

    const filteredData = chartData.filter((item) => {
        const date = new Date(item.date)
        const referenceDate = new Date()
        let daysToSubtract = 90
        if (timeRange === "30d") {
            daysToSubtract = 30
        } else if (timeRange === "7d") {
            daysToSubtract = 7
        }
        const startDate = new Date(referenceDate)
        startDate.setDate(startDate.getDate() - daysToSubtract)
        return date >= startDate
    })

    const totalValue = (section: { [sectionName: string]: StockEntry[] }) => {
        let totalWorth = 0;
        for (const sectionName in section) {
            const stocks = section[sectionName];
            for (const stock of stocks) {
                totalWorth += stock["Current position + adds/sales"];
            }
        }
        return totalWorth / 1000;
    }

    useEffect(() => {
        fetch('http://localhost:8080/awp_history')
            .then((response) => response.json())
            .then((data) => {
                const transformedData = data.map((entry: { date: string; data: { [key: string]: StockEntry[] } }) => ({
                    date: entry.date,
                    data: {
                        section1: totalValue(entry.data["Section 1"]),
                        section4: totalValue(entry.data["Section 4"]),
                        section5: totalValue(entry.data["Section 5"]),
                        section6: totalValue(entry.data["Section 6"]),
                        section7: totalValue(entry.data["Section 7"]),
                    },
                }));

                setChartData(transformedData);
            });
    }, []);

    return (
                <div className="p-8 bg-gray-50 min-h-screen">
                    <Card>
                        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                            <div className="grid flex-1 gap-1 text-center sm:text-left">
                                <CardTitle>Portfolio Value Over Time</CardTitle>
                                <CardDescription>Showing portfolio value from historic records</CardDescription>
                            </div>
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto" aria-label="Select a value">
                                    <SelectValue placeholder="Last 3 months" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="90d" className="rounded-lg">
                                        Last 3 months
                                    </SelectItem>
                                    <SelectItem value="30d" className="rounded-lg">
                                        Last 30 days
                                    </SelectItem>
                                    <SelectItem value="7d" className="rounded-lg">
                                        Last 7 days
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                            <ChartContainer config={chartConfig} className="aspect-auto h-[450px] w-full">
                                <AreaChart data={filteredData}>
                                    <defs>
                                        <linearGradient id="fillSection1" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id="fillSection4" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id="fillSection5" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#34d399" stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id="fillSection6" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id="fillSection7" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#f87171" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        minTickGap={32}
                                        tickFormatter={(value) => {
                                            const date = new Date(value)
                                            return date.toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })
                                        }}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(value) => {
                                                    return new Date(value).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })
                                                }}
                                                indicator="dot"
                                            />
                                        }
                                    />
                                    <Area name="Section 1 " dataKey="data.section1" type="natural" fill="url(#fillSection1)" stroke="#2563eb" stackId="a" />
                                    <Area name="Section 2" dataKey="data.section4" type="natural" fill="url(#fillSection4)" stroke="#60a5fa" stackId="a" />
                                    <Area name="Section 3" dataKey="data.section5" type="natural" fill="url(#fillSection5)" stroke="#34d399" stackId="a" />
                                    <Area name="Section 4" dataKey="data.section6" type="natural" fill="url(#fillSection6)" stroke="#fbbf24" stackId="a" />
                                    <Area name="Section 5" dataKey="data.section7" type="natural" fill="url(#fillSection7)" stroke="#f87171" stackId="a" />
                                    <ChartLegend content={<ChartLegendContent />} />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
    );
};

export default StateGraph;