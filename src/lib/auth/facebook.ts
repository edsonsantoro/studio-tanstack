import { Facebook } from 'arctic';

const getAppUrl = (request?: Request) => {
    if (process.env.NODE_ENV === 'production') {
        return 'https://cwlrh.netlify.app';
    }
    
    if (request) {
        const url = new URL(request.url);
        return `${url.protocol}//${url.host}`;
    }

    if (process.env.VITE_APP_URL) return process.env.VITE_APP_URL;
    if (process.env.URL) return process.env.URL;
    return 'http://localhost:5173';
};

export const getFacebookClient = (request?: Request) => {
    const id = process.env.FACEBOOK_APP_ID;
    const secret = process.env.FACEBOOK_APP_SECRET;

    if (!id || !secret) {
        console.warn('Facebook OAuth credentials missing.');
        return null;
    }

    return new Facebook(id, secret, `${getAppUrl(request)}/login/facebook/callback`);
};

export const facebook = getFacebookClient();
