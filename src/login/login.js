import { ACCESS_TOKEN, TOKEN_TYPE, EXPIRES_IN }from "../common";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const scopes = "user-top-read user-follow-read playlist-read-private user-library-read";
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const APP_URL = import.meta.env.VITE_APP_URL;
const authorizeUser = () => {
    const url = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=${scopes}&show_diolog=true`;
    window.open(url, "login", "width=800,height=600")
}

document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("login-to-spotify");
    loginButton.addEventListener("click", authorizeUser);

})

window.setItemsInLocalStorage = ({ accessToken, tokenType, expiresIn })=>{
    localStorage.setItem(ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_TYPE, tokenType);
    localStorage.setItem(EXPIRES_IN,(Date.now() + (expiresIn *1000)));
    window.location.href = APP_URL;

}

window.addEventListener("load", () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    if (accessToken) {
        window.location.href = `${APP_URL}/dashboard/dashboard.html`;

    }
    if (window.opener && !window.opener.closed) {
        window.focus();
        if (window.location.href.includes("error")) {
            Window.close();
        }
        const { hash } = window.location;
        const searchParams = new URLSearchParams(hash);
        const accessToken = searchParams.get("#access_token");
        const tokenType = searchParams.get("token_type");
        const expiresIn = searchParams.get("expires_in");
        if (accessToken) {
            window.close();
            window.opener.setItemsInLocalStorage({accessToken, tokenType, expiresIn});
        }else{
            window.close();
        }

    }
})
