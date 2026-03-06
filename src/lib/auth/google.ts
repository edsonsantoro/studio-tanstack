import { Google } from 'arctic';

const getAppUrl = (request?: Request) => {
    // 1. Se tiver a requisição (Server Side), extrai o host dinamicamente (Porta Real)
    if (request) {
        const url = new URL(request.url);
        return `${url.protocol}//${url.host}`;
    }

    // 2. Fallbacks (Ambiente ou Padrão)
    if (process.env.VITE_APP_URL) return process.env.VITE_APP_URL;
    if (process.env.URL) return process.env.URL; // Netlify
    return 'http://localhost:5173'; // Novo padrão Vite
};

export const getGoogleClient = (request?: Request) => {
    const id = process.env.GOOGLE_CLIENT_ID;
    const secret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!id || !secret) {
        console.warn('Google OAuth credentials missing.');
        return null;
    }

    const callbackUrl = `${getAppUrl(request)}/login/google/callback`;
    console.log(`DEBUG: Google OAuth Callback URL -> ${callbackUrl}`);
    
    return new Google(id, secret, callbackUrl);
};

export const google = getGoogleClient();
