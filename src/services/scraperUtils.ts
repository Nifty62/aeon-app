// This utility function centralizes the logic for fetching content via a CORS proxy.
export async function fetchWithProxy(url: string): Promise<string> {
    // Using corsproxy.io as it has proven more reliable.
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            const errorBody = await response.text().catch(() => 'Could not read error body.');
            throw new Error(`Proxy fetch failed for ${url} with status ${response.status}. Body: ${errorBody}`);
        }
        const text = await response.text();
        // Check for common blocking pages that proxies might return.
        if (text.includes("Cloudflare") || text.includes("Verifying you are human") || text.includes("challenge-platform")) {
             throw new Error(`Could not bypass site protection for ${url}. The proxy returned a challenge page.`);
        }
        return text;
    } catch (error) {
        // Log the detailed error but re-throw to be caught by the calling function.
        console.error(`Error in fetchWithProxy for url: ${url}`, error);
        throw error;
    }
}
