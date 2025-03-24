import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

export default function DashboardLayout({
                                            children,
                                        }: Readonly<{
    children: React.ReactNode;
}>) {
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
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}