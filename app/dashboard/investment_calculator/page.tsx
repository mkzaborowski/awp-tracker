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
import { Input } from "@/components/ui/input";

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

const Dashboard: React.FC = () => {
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
    const [investmentAmount, setInvestmentAmount] = useState<string>("");
    const [calculations, setCalculations] = useState<any[]>([]);
    const [totalPortfolioValue, setTotalPortfolioValue] = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('http://localhost:8080/awp_state');
            const data: PortfolioData = await response.json();
            setPortfolioData(data);

            // Calculate total portfolio value
            const total = Object.values(data).reduce((sectionSum, section) => {
                const sectionTotal = Object.values(section).reduce((companySum, companyData) => {
                    const value = companyData[0]["Starting position + adds"];
                    return companySum + value;
                }, 0);
                return sectionSum + sectionTotal;
            }, 0);

            setTotalPortfolioValue(total);
        };
        fetchData();
    }, []);

    const calculateInvestments = (amount: number) => {
        if (!portfolioData || !amount || !totalPortfolioValue) return [];

        const allCompanies = Object.entries(portfolioData).flatMap(([section, companies]) =>
            Object.entries(companies).map(([company, data]) => {
                const companyData = data[0];
                const currentValue = companyData["Starting position + adds"];
                const portfolioPercentage = (currentValue / totalPortfolioValue);
                const allocatedAmount = amount * portfolioPercentage;
                const sharesToBuy = Math.floor(allocatedAmount / companyData["Current price"]);
                const actualInvestment = sharesToBuy * companyData["Current price"];

                return {
                    section,
                    company: company.trim(),
                    ticker: companyData.Ticker,
                    currentValue,
                    price: companyData["Current price"],
                    portfolioPercentage: portfolioPercentage * 100,
                    sharesToBuy,
                    investment: actualInvestment,
                    targetInvestment: allocatedAmount
                };
            })
        );

        return allCompanies.sort((a, b) => b.portfolioPercentage - a.portfolioPercentage);
    };

    const handleInvestmentChange = (value: string) => {
        setInvestmentAmount(value);
        const amount = parseFloat(value.replace(/[^0-9.]/g, ''));
        if (!isNaN(amount)) {
            setCalculations(calculateInvestments(amount));
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    };

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
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Portfolio-Wide Investment Calculator</h1>
                            <p className="text-gray-600 mt-2">Total Portfolio
                                Value: {formatCurrency(totalPortfolioValue)}</p>
                        </div>
                        <Input
                            type="text"
                            placeholder="Investment amount"
                            value={investmentAmount}
                            onChange={(e) => handleInvestmentChange(e.target.value)}
                            className="w-48"
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Investment Distribution Across All Sections</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Section</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Ticker</TableHead>
                                        <TableHead>Current Value</TableHead>
                                        <TableHead>Portfolio %</TableHead>
                                        <TableHead>Target Investment</TableHead>
                                        <TableHead>Shares to Buy</TableHead>
                                        <TableHead>Actual Investment</TableHead>
                                        <TableHead>Difference</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {calculations.map((calc, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{calc.section}</TableCell>
                                            <TableCell className="font-medium">{calc.company}</TableCell>
                                            <TableCell>{calc.ticker}</TableCell>
                                            <TableCell>{formatCurrency(calc.currentValue)}</TableCell>
                                            <TableCell>{calc.portfolioPercentage.toFixed(2)}%</TableCell>
                                            <TableCell>{formatCurrency(calc.targetInvestment)}</TableCell>
                                            <TableCell>{calc.sharesToBuy.toLocaleString()}</TableCell>
                                            <TableCell>{formatCurrency(calc.investment)}</TableCell>
                                            <TableCell
                                                className={calc.investment - calc.targetInvestment > 0 ? "text-green-600" : "text-red-600"}>
                                                {formatCurrency(calc.investment - calc.targetInvestment)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {calculations.length > 0 && (
                                        <TableRow className="font-bold">
                                            <TableCell colSpan={5}>Total</TableCell>
                                            <TableCell>{formatCurrency(calculations.reduce((sum, calc) => sum + calc.targetInvestment, 0))}</TableCell>
                                            <TableCell></TableCell>
                                            <TableCell>{formatCurrency(calculations.reduce((sum, calc) => sum + calc.investment, 0))}</TableCell>
                                            <TableCell
                                                className={calculations.reduce((sum, calc) => sum + (calc.investment - calc.targetInvestment), 0) > 0 ? "text-green-600" : "text-red-600"}>
                                                {formatCurrency(calculations.reduce((sum, calc) => sum + (calc.investment - calc.targetInvestment), 0))}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Dashboard;