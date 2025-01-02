'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { checkAuth } from '../utils/auth';
import Link from "next/link";

const HomePage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(checkAuth());
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-grow flex flex-col items-center justify-center p-8">
                <h1 className="text-6xl font-bold text-center mb-4">
                    Welcome to Our Platform
                </h1>

                <div className="text-lg mb-8">
                    {isLoggedIn ? (
                        <span className="text-green-600">You are logged in</span>
                    ) : (
                        <span className="text-gray-600">Please sign in to continue</span>
                    )}
                </div>

                <Button
                    className="px-6 py-3 text-lg"
                >
                    <Link href={isLoggedIn ? '/dashboard' : '/login'}>{isLoggedIn ? 'Go to Dashboard' : 'Login'}</Link>
                </Button>
            </main>

            <footer className="bg-gray-100 py-4 text-center text-gray-600">
                <p>&copy; 2025 Our Platform. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default HomePage;