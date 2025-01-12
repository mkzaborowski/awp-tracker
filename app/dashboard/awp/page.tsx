'use client';

import {useState, useEffect, ReactNode} from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [selectedSection, setSelectedSection] = useState("Section 1");



  useEffect(() => {
    // Replace with actual fetch
    const fetchData = async () => {
      const response = await fetch('https://98.67.165.93:8443/awp_state');
      const data = await response.json();
      setData(data);
    };
    fetchData();
  }, []);

  if (!data) return <div className="p-8">Loading...</div>;

  const sections = Object.keys(data);
  const currentSectionData = data[selectedSection];
  const portfolioItems = Object.entries(currentSectionData).map(([company, details]) => ({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    ...(details[0] as PortfolioDetails),
    company: company.trim()
  }));
  const ClickableTableRow = ({ children, ticker } : {children: ReactNode, ticker: string}) => {
    const handleClick = () => {
      window.open(`https://stooq.pl/q/?s=${ticker.trim()}.us`, '_blank');
    };

    return (
        <TableRow
            className="cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={handleClick}
        >
          {children}
        </TableRow>
    );
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
              <h1 className="text-3xl font-bold text-gray-900">Portfolio Overview</h1>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select section"/>
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600">Total Assets</p>
                    <p className="text-2xl font-bold">
                      {portfolioItems.reduce((sum, item) => sum + (item.Shares * item["Current price"]), 0).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      })}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600">Total Gain/Loss</p>
                    <p className="text-2xl font-bold">
                      {portfolioItems.reduce((sum, item) => sum + item["Gain/Loss"], 0).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Ticker</TableHead>
                        <TableHead>Shares</TableHead>
                        <TableHead>Current Price</TableHead>
                        <TableHead>Portfolio %</TableHead>
                        <TableHead>TT Score</TableHead>
                        <TableHead>Day Change %</TableHead>
                        <TableHead>Gain/Loss</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {portfolioItems.map((item, index) => (
                          <ClickableTableRow key={index} ticker={item.Ticker}>
                            <TableCell className="font-medium">{item.Company}</TableCell>
                            <TableCell>{item.Ticker}</TableCell>
                            <TableCell>{item.Shares != undefined ? item.Shares.toLocaleString() : item["Coin/stock"].toLocaleString()}</TableCell>
                            <TableCell>
                              ${item["Current price"].toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </TableCell>
                            <TableCell>
                              {(item["% of portfolio assets"] * 100).toFixed(2)}%
                            </TableCell>
                            <TableCell>{item["TT Score"]}</TableCell>
                            <TableCell
                                className={item["Day Chng %"] > 0 ? "text-green-600" : "text-red-600"}>
                              {item["Day Chng %"]}%
                            </TableCell>
                            <TableCell
                                className={item["Gain/Loss"] > 0 ? "text-green-600" : "text-red-600"}>
                              ${item["Gain/Loss"].toLocaleString()}
                            </TableCell>
                          </ClickableTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

        </SidebarInset>
      </SidebarProvider>
  );
};

export default Dashboard;
