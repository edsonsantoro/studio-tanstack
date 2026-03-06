import { Twitter } from "arctic";

const getAppUrl = (request?: Request) => {
    if (request) {
        const url = new URL(request.url);
        return `${url.protocol}//${url.host}`;
    }

    if (process.env.VITE_APP_URL) return process.env.VITE_APP_URL;
    if (process.env.URL) return process.env.URL;
    return 'http://localhost:5173';
};

export const getTwitterClient = (request?: Request) => {
    const id = process.env.TWITTER_CLIENT_ID;
    const secret = process.env.TWITTER_CLIENT_SECRET;

    if (!id || !secret) {
        console.warn("Twitter OAuth credentials missing.");
        return null;
    }

    return new Twitter(id, secret, `${getAppUrl(request)}/login/twitter/callback`);
};

export const twitter = getTwitterClient();
