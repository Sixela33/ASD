
export default function GoogleOauth() {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth"
    const GOOGLE_OAUTH_BASE_URL = import.meta.env.VITE_NODE_ENV === 'production' ? import.meta.env.VITE_BASE_PATH : 'http://localhost:8080';
    console.log(GOOGLE_OAUTH_BASE_URL + '/api/users/oauthlogin')
    
    const options = {
        redirect_uri: GOOGLE_OAUTH_BASE_URL + '/api/users/oauthlogin',
        client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/presentations",
        "https://www.googleapis.com/auth/documents",
        "https://www.googleapis.com/auth/drive"
        ].join(" "),
    }

    const qs = new URLSearchParams(options);

    return `${rootUrl}?${qs.toString()}`;
}
