import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const cognitoDomain = "https://eu-north-1u2owrw0uj.auth.eu-north-1.amazoncognito.com";

const settings = {
    authority: cognitoDomain,
    client_id: "44kcjem8l1tfbs213vdq5cia6d",
    redirect_uri: "http://localhost:3000/",
    response_type: "code",
    scope: "openid email phone",
    post_logout_redirect_uri: "http://localhost:3000/",
    userStore: new WebStorageStateStore({
        store: window.localStorage
    }),
    metadata: {
        authorization_endpoint: cognitoDomain + "/oauth2/authorize",
        token_endpoint: cognitoDomain + "/oauth2/token",
        revocation_endpoint: cognitoDomain + "/oauth2/revoke",
        userinfo_endpoint: cognitoDomain + "/oauth2/userInfo",
        end_session_endpoint: cognitoDomain + "/logout",
        issuer: cognitoDomain
    }
};

const userManager = new UserManager(settings);

async function login() {
    await userManager.signinRedirect();
}

async function logout() {
    await userManager.signoutRedirect();
}

async function checkUser() {
    const user = await userManager.getUser();

    const loginButton = document.getElementById("loginButton");
    const userInfo = document.getElementById("userInfo");
    const userEmail = document.getElementById("userEmail");
    const logoutButton = document.getElementById("logoutButton");

    if (user && !user.expired) {
        window.currentUserId = user.profile.sub;
        loginButton.style.display = "none";
        userInfo.style.display = "block";
        userEmail.textContent = user.profile.email || "User";
        logoutButton.onclick = logout;
    } else {
        loginButton.style.display = "inline-block";
        userInfo.style.display = "none";
        loginButton.onclick = login;
    }
}

async function initializeAuth() {
    try {
        if (window.location.search.includes("code=")) {
            console.log("Cognito callback detected");

            await userManager.signinRedirectCallback();

            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            );

            console.log("Cognito login completed");
        }

        await checkUser();

    } catch (error) {
        console.error("Authentication error:", error);
    }
}

window.addEventListener("DOMContentLoaded", initializeAuth);