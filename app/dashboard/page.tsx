'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

interface CompanyData {
    "% of portfolio assets": number;
    "Company/Asset": string;
    "Ticker": string;
    "TT Score": number;
    "Shares": number;
    "Starting position + adds": number;
    "Current position + adds/sales": number;
    "Price at start/add ": number;
    "Day Chng %": number;
    "Current price": number;
    "Price change": number;
    "% Gain/loss ": number;
    "Gain/Loss": number;
    "Div Yield": number;
}

interface PortfolioData {
    [section: string]: {
        [company: string]: CompanyData[];
    };
}

interface Portfolio {
    [company: string]: CompanyData[];
}

const Dashboard = () => {
    const [portfolio1, setPortfolio1] = useState<Portfolio | null>(null);
    const [portfolio2, setPortfolio2] = useState<Portfolio | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            // Replace with actual API endpoints
            const [response1, response2] = await Promise.all([
                fetch('/api/state'),
                fetch('/api/state')
            ]);
            const data1 = await response1.json() as PortfolioData;
            const data2 = await response2.json() as PortfolioData;

            setPortfolio1(data1["Section 1"]);
            setPortfolio2(data2["Section 1"]);
        };
        fetchData();
    }, []);

    const comparePortfolios = () => {
        if (!portfolio1 || !portfolio2) return [];

        const allCompanies = new Set([
            ...Object.keys(portfolio1),
            ...Object.keys(portfolio2)
        ]);

        return Array.from(allCompanies).map(company => {
            const p1Data = portfolio1[company]?.[0] || {};
            const p2Data = portfolio2[company]?.[0] || {};

            return {
                company: company.trim(),
                portfolio1: {
                    shares: p1Data.Shares || 0,
                    price: p1Data["Current price"] || 0,
                    value: (p1Data.Shares || 0) * (p1Data["Current price"] || 0),
                    ttScore: p1Data["TT Score"] || 0,
                    dayChange: p1Data["Day Chng %"] || 0
                },
                portfolio2: {
                    shares: p2Data.Shares || 0,
                    price: p2Data["Current price"] || 0,
                    value: (p2Data.Shares || 0) * (p2Data["Current price"] || 0),
                    ttScore: p2Data["TT Score"] || 0,
                    dayChange: p2Data["Day Chng %"] || 0
                },
                diff: {
                    shares: (p1Data.Shares || 0) - (p2Data.Shares || 0),
                    value: ((p1Data.Shares || 0) * (p1Data["Current price"] || 0)) -
                        ((p2Data.Shares || 0) * (p2Data["Current price"] || 0))
                }
            };
        });
    };

    const comparisonData = comparePortfolios();

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b">
                    <div className="flex items-center gap-2 px-3">
                        <SidebarTrigger/>
                        <Separator orientation="vertical" className="mr-2 h-4"/>
                    </div>
                </header>
                <div className="p-8 bg-gray-50 min-h-screen">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Portfolio Comparison Analysis</h1>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Portfolio Comparison</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Company</TableHead>
                                            <TableHead>P1 Shares</TableHead>
                                            <TableHead>P2 Shares</TableHead>
                                            <TableHead>Diff Shares</TableHead>
                                            <TableHead>P1 Value</TableHead>
                                            <TableHead>P2 Value</TableHead>
                                            <TableHead>Value Diff</TableHead>
                                            <TableHead>P1 TT Score</TableHead>
                                            <TableHead>P2 TT Score</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {comparisonData.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{item.company}</TableCell>
                                                <TableCell>{item.portfolio1.shares.toLocaleString()}</TableCell>
                                                <TableCell>{item.portfolio2.shares.toLocaleString()}</TableCell>
                                                <TableCell className={item.diff.shares > 0 ? "text-green-600" : "text-red-600"}>
                                                    {item.diff.shares.toLocaleString()}
                                                </TableCell>
                                                <TableCell>${item.portfolio1.value.toLocaleString()}</TableCell>
                                                <TableCell>${item.portfolio2.value.toLocaleString()}</TableCell>
                                                <TableCell className={item.diff.value > 0 ? "text-green-600" : "text-red-600"}>
                                                    ${item.diff.value.toLocaleString()}
                                                </TableCell>
                                                <TableCell>{item.portfolio1.ttScore}</TableCell>
                                                <TableCell>{item.portfolio2.ttScore}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Portfolio 1 Details</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Company</TableHead>
                                            <TableHead>Shares</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Value</TableHead>
                                            <TableHead>Day Change %</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {portfolio1 && Object.entries(portfolio1).map(([company, data]) => (
                                            <TableRow key={company}>
                                                <TableCell className="font-medium">{company}</TableCell>
                                                <TableCell>{data[0].Shares.toLocaleString()}</TableCell>
                                                <TableCell>${data[0]["Current price"].toLocaleString()}</TableCell>
                                                <TableCell>
                                                    ${(data[0].Shares * data[0]["Current price"]).toLocaleString()}
                                                </TableCell>
                                                <TableCell className={data[0]["Day Chng %"] > 0 ? "text-green-600" : "text-red-600"}>
                                                    {data[0]["Day Chng %"]}%
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Portfolio 2 Details</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Company</TableHead>
                                            <TableHead>Shares</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Value</TableHead>
                                            <TableHead>Day Change %</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {portfolio2 && Object.entries(portfolio2).map(([company, data]) => (
                                            <TableRow key={company}>
                                                <TableCell className="font-medium">{company}</TableCell>
                                                <TableCell>{data[0].Shares.toLocaleString()}</TableCell>
                                                <TableCell>${data[0]["Current price"].toLocaleString()}</TableCell>
                                                <TableCell>
                                                    ${(data[0].Shares * data[0]["Current price"]).toLocaleString()}
                                                </TableCell>
                                                <TableCell className={data[0]["Day Chng %"] > 0 ? "text-green-600" : "text-red-600"}>
                                                    {data[0]["Day Chng %"]}%
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Dashboard;