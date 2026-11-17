const GOOGLE_SCRIPT_ID = 'google-login-script';
const GOOGLE_CLIENT_ID = '682446417323-24l2f06p3ojfq1uop8k63crnmb5503dv.apps.googleusercontent.com';

let googleScriptPromise;
let googleInitialized = false;

function loadGoogleIdentityServices() {
    if (window.google?.accounts?.id) {
        return Promise.resolve(window.google.accounts.id);
    }

    if (!googleScriptPromise) {
        googleScriptPromise = new Promise((resolve, reject) => {
            let script = document.getElementById(GOOGLE_SCRIPT_ID);
            const handleLoad = () => {
                if (window.google?.accounts?.id) {
                    resolve(window.google.accounts.id);
                } else {
                    reject(new Error('Google Identity Services loaded without its API.'));
                }
            };

            if (!script) {
                script = document.createElement('script');
                script.id = GOOGLE_SCRIPT_ID;
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.defer = true;
            }

            script.addEventListener('load', handleLoad, { once: true });
            script.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services.')), { once: true });

            if (!script.isConnected) {
                document.body.appendChild(script);
            }
        }).catch((error) => {
            googleScriptPromise = undefined;
            throw error;
        });
    }

    return googleScriptPromise;
}

export async function renderGoogleSignInButton({ containerId, text, onCredential, isActive }) {
    const googleId = await loadGoogleIdentityServices();

    if (!googleInitialized) {
        googleId.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => {
                if (response.credential) {
                    onCredential(response.credential);
                }
            },
        });
        googleInitialized = true;
    }

    if (!isActive()) {
        return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }

    if (container.dataset.googleButtonRendered === 'true') {
        return;
    }

    const containerWidth = Math.round(container.getBoundingClientRect().width);
    const buttonWidth = Math.min(Math.max(containerWidth, 200), 400);
    googleId.renderButton(container, {
        theme: 'filled_black',
        size: 'large',
        width: buttonWidth,
        text,
        shape: 'pill',
    });
    container.dataset.googleButtonRendered = 'true';
}
