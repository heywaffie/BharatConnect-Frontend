import { useEffect, useRef, useState } from 'react';

let scriptLoadingPromise;

function loadGoogleScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }
  if (!scriptLoadingPromise) {
    scriptLoadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Sign-In script.'));
      document.head.appendChild(script);
    });
  }
  return scriptLoadingPromise;
}

export function GoogleSignInButton({
  clientId,
  onCredential,
  onError,
  disabled = false,
}) {
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    if (!clientId || disabled) {
      setReady(false);
      return () => {
        active = false;
      };
    }

    loadGoogleScript()
      .then(() => {
        if (!active || !buttonRef.current || !window.google?.accounts?.id) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response?.credential) {
              onError?.(new Error('Google Sign-In did not return a credential.'));
              return;
            }
            onCredential?.(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        buttonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: 360,
        });

        setReady(true);
      })
      .catch((err) => {
        if (active) {
          onError?.(err);
        }
      });

    return () => {
      active = false;
    };
  }, [clientId, disabled, onCredential, onError]);

  return (
    <div className="space-y-2">
      <div ref={buttonRef} className={`${disabled ? 'opacity-50 pointer-events-none' : ''}`} />
      {!ready && !disabled && (
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 text-sm font-semibold cursor-not-allowed opacity-60"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="" />
          Preparing Google Sign-In...
        </button>
      )}
    </div>
  );
}
