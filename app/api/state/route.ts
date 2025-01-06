// app/api/state/route.js
export async function GET() {
    try {
        const response = await fetch('http://98.67.165.93:8080/awp_state', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Add cache: 'no-store' if you don't want to cache the response
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`API responded with status, eroryn: ${response.status}`);
        }

        const data = await response.json();

        return Response.json(data, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET'
            }
        });

    } catch (error) {
        console.error('Proxy error:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}