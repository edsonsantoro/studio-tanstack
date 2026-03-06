import { db } from '@/db';
import { hotmartCourseLinks } from '@/db/schema';

export interface HotmartProduct {
    id: string;
    name: string;
    description?: string;
    url: string;
    imageUrl: string;
    price: string;
    format?: string;
    periodicity?: string;
    currencyCode?: string;
}

interface PriceResult {
    formattedPrice: string;
    periodicity: string;
    currencyCode: string;
}

function getCurrencySymbol(currencyCode: string): string {
    const symbols: Record<string, string> = {
        'BRL': 'R$',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'ARS': '$',
        'MXN': '$',
        'CLP': '$',
        'COP': '$',
        'PEN': 'S/',
    };
    return symbols[currencyCode] || currencyCode;
}

function getCurrencyForLocale(locale: string): string {
    switch (locale.toLowerCase()) {
        case 'pt': return 'BRL';
        case 'en': return 'USD';
        case 'es': return 'BRL';
        case 'de': return 'EUR';
        default: return 'USD';
    }
}





// Fallback data provided by the user to be used when API is unavailable
const FALLBACK_ITEMS = [
    {
        "id": 698441,
        "name": "Série: A Nova Aliança",
        "ucode": "f2b3be1f-313f-4a2d-b5b7-1c39d67dd3ee",
        "status": "ACTIVE",
        "format": "VIDEOS",
        "is_subscription": false,
        "description": "Uma jornada profunda sobre a liberdade em Cristo.",
        "price": { "value": 10, "currency_code": "BRL" }
    },
    {
        "id": 698442,
        "name": "Manual: Identidade em Cristo",
        "ucode": "manual-identidade",
        "status": "ACTIVE",
        "format": "EBOOK",
        "is_subscription": false,
        "description": "Entenda quem você é n'Ele através das escrituras.",
        "price": { "value": 20, "currency_code": "BRL" }
    },
    {
        "id": 800001,
        "name": "Comunidade Sem Limites (Assinatura)",
        "ucode": "comunidade-limitless",
        "status": "ACTIVE",
        "format": "COMMUNITY",
        "is_subscription": true,
        "description": "Acesso total a todos os treinamentos e transmissões.",
        "price": { "value": 600, "currency_code": "BRL" }
    }
];

export async function getHotmartProducts(includeUnlinked: boolean = false, locale: string = 'pt'): Promise<HotmartProduct[]> {
    const token = await getHotmartToken();

    try {
        let rawItems = [];
        let fetchedToken = token;

        if (fetchedToken) {
            console.log("Fetching Hotmart products (API v1)...");
            const response = await fetch(`https://developers.hotmart.com/products/api/v1/products?max_results=100&status=ACTIVE`, {
                headers: {
                    "Authorization": `Bearer ${fetchedToken}`,
                    "User-Agent": "StudioApp/1.0",
                    "Content-Type": "application/json"
                },
            });

            if (response.ok) {
                const data = await response.json();
                const allItems = data.items || [];

                // Simple filtering: only ACTIVE products
                rawItems = allItems.filter((p: any) => p.status === 'ACTIVE');
            } else {
                console.warn("Hotmart API fetch failed, using fallback samples.");
                rawItems = FALLBACK_ITEMS;
            }
        } else {
            console.warn("No token obtained, using fallback samples.");
            rawItems = FALLBACK_ITEMS;
        }

        // Fetch manual links and images from DB
        let manualLinks: any[] = [];
        try {
            manualLinks = await db.select().from(hotmartCourseLinks);
        } catch (dbError) {
            console.warn("Database connection unavailable for manual links, proceeding without them.");
        }
        const linkMap = new Map(manualLinks.map(l => [l.hotmartId, l]));

        const products = await Promise.all(rawItems.map(async (p: any) => {
            const hotmartId = String(p.id);
            const ucode = String(p.ucode || p.id || "");
            const name = p.name || p.title || "Curso sem nome";
            const isSubscription = p.is_subscription === true;

            const manualMapping = linkMap.get(hotmartId);

            // Fetch price info
            let priceInfo: PriceResult = { formattedPrice: "Consultar valor", periodicity: "", currencyCode: "" };
            if (p.price?.value) {
                const currencyCode = p.price.currency_code || 'BRL';
                const symbol = getCurrencySymbol(currencyCode);
                priceInfo.formattedPrice = `${symbol} ${p.price.value}`;
                priceInfo.currencyCode = currencyCode;
            } else if (fetchedToken) {
                priceInfo = await fetchPriceForProduct(fetchedToken, ucode, isSubscription);
            }

            // Image Priority: Manual > Hotmart > Fallback
            let imgUrl = manualMapping?.manualImageUrl || "";
            if (!imgUrl) {
                if (p.card_image_url) imgUrl = p.card_image_url;
                else if (p.portrait_image_url) imgUrl = p.portrait_image_url;
                else if (typeof p.image === 'string') imgUrl = p.image;
                else if (p.image?.url) imgUrl = p.image.url;
                else if (p.media?.url) imgUrl = p.media.url;
            }

            return {
                id: hotmartId,
                name: name,
                description: p.description || "",
                // URL Priority: Manual > Short ID (automatic)
                url: manualMapping?.manualUrl || `https://hotmart.com/pt-br/marketplace/produtos/${hotmartId}`,

                imageUrl: imgUrl,
                price: priceInfo.formattedPrice,
                format: p.format,
                periodicity: priceInfo.periodicity,
                currencyCode: priceInfo.currencyCode,
                _hasManualLink: !!manualMapping?.manualUrl,
                _hasManualImage: !!manualMapping?.manualImageUrl,
                _manualUrl: manualMapping?.manualUrl || "",
                _manualImageUrl: manualMapping?.manualImageUrl || ""
            };
        }));


        // Final Filter: 
        // 1. Language/Metadata (already done above)
        // 2. Currency (Matched with locale, unless 'all' is passed)
        // 3. Exclude specific disabled products (e.g. ID 4343381)
        // Note: All products now have automatic working links via short ID
        const targetCurrency = locale === 'all' ? null : getCurrencyForLocale(locale);
        const filtered = products.filter(p =>
            (locale === 'all' || !p.currencyCode || p.currencyCode === targetCurrency) &&
            p.id !== '4343381'
        );



        return filtered;
    } catch (error) {
        console.error("Error fetching Hotmart products:", error);
        return [];
    }
}

function isUUID(str: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

async function fetchPriceForProduct(token: string, ucode: string, isSubscription: boolean): Promise<PriceResult> {
    const endpoint = isSubscription ? 'plans' : 'offers';
    const url = `https://developers.hotmart.com/products/api/v1/products/${ucode}/${endpoint}`;
    const defaultResult: PriceResult = { formattedPrice: "Consultar valor", periodicity: "", currencyCode: "" };

    try {
        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "User-Agent": "StudioApp/1.0",
                "Content-Type": "application/json"
            },
        });
        if (!response.ok) return defaultResult;
        const data: any = await response.json();
        const items = data.items || [];
        if (items.length === 0) return defaultResult;
        let target = items[0];
        if (!isSubscription) {
            target = items.find((i: any) => i.is_main_offer) || items[0];
        }
        if (target.price?.value) {
            const currencyCode = target.price.currency_code || 'BRL';
            const symbol = getCurrencySymbol(currencyCode);
            return {
                formattedPrice: `${symbol} ${target.price.value}`,
                periodicity: target.periodicity || "",
                currencyCode: currencyCode
            };
        }
        return defaultResult;
    } catch (error) {
        return defaultResult;
    }
}

async function getHotmartToken(): Promise<string | null> {
    const clientId = process.env.HOTMART_CLIENT_ID;
    const clientSecret = process.env.HOTMART_CLIENT_SECRET;
    const basicAuth = process.env.HOTMART_BASIC_AUTH;
    if (!clientId || !clientSecret) return null;

    try {
        const id = clientId.trim();
        const secret = clientSecret.trim();
        let authHeader = basicAuth ? (basicAuth.trim().startsWith("Basic ") ? basicAuth.trim() : `Basic ${basicAuth.trim()}`) : `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`;
        const url = new URL("https://api-sec-vlc.hotmart.com/security/oauth/token");
        url.searchParams.append("grant_type", "client_credentials");
        url.searchParams.append("client_id", id);
        url.searchParams.append("client_secret", secret);
        const response = await fetch(url.toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": authHeader, "User-Agent": "StudioApp/1.0" },
            cache: 'no-store'
        });
        if (!response.ok) return null;
        const data: any = await response.json();
        return data.access_token || null;
    } catch (error) {
        return null;
    }
}

export async function searchHotmartProduct(query: string): Promise<HotmartProduct | null> {
    const token = await getHotmartToken();
    if (!token) return null;
    try {
        const response = await fetch(`https://developers.hotmart.com/products/api/v1/products?max_results=50`, {
            headers: { "Authorization": `Bearer ${token}`, "User-Agent": "StudioApp/1.0" },
        });
        const data: any = await response.json();
        const products = data.items || [];
        const match = products.find((p: any) => p.name.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(p.name.toLowerCase()));
        if (!match) return null;

        // Check for manual link
        const manualMapping = await db.query.hotmartCourseLinks.findFirst({
            where: eq(hotmartCourseLinks.hotmartId, String(match.id))
        });

        return {
            id: String(match.id),
            name: match.name,
            url: manualMapping?.manualUrl || `https://hotmart.com/pt-br/marketplace/produtos/${match.ucode || match.id}`,
            imageUrl: manualMapping?.manualImageUrl || match.image || match.card_image_url || "",
            price: match.price?.value ? `${match.price.currency_code} ${match.price.value}` : "",
        };
    } catch (error) {
        return null;
    }
}

import { eq } from 'drizzle-orm';
