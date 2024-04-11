
export default function GoogleOauth() {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth"
    const GOOGLE_OAUTH_URL = process.env.VITE_BASE_PATH + '/api/users/oauthlogin'
    const options = {
        redirect_uri: GOOGLE_OAUTH_URL,
        client_id: process.env.VITE_OAUTH_CLIENT_ID,
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
    }

    const qs = new URLSearchParams(options);

    return `${rootUrl}?${qs.toString()}`;
}
