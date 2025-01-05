import { NextResponse } from 'next/server';
import { processGoogleSheet } from '@/app/utils/parser';

export async function GET() {
    try {
        const sheetUrl = process.env.SHEET_URL as string;
        const result = await processGoogleSheet(sheetUrl);
        return NextResponse.json(result.organizedData);
    } catch (error) {
        console.error('Failed to process sheet:', error);
        return NextResponse.json({ error: 'Failed to process sheet' }, { status: 500 });
    }
}