import {useState, useEffect} from 'react';
import {X, Download, Monitor} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>;
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if the app is already installed using CSS media query
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppMode = (window.navigator as {standalone?: boolean}).standalone === true;
      
      if (isStandalone || isInWebAppMode) {
        setIsInstalled(true);
        setShowBanner(false);
        return true;
      }
      return false;
    };

    // Initial check
    if (checkIfInstalled()) {
      return;
    }

    // Check if user previously dismissed the banner
    const dismissed = localStorage.getItem('pwa-install-banner-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show our custom banner
      setShowBanner(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      // Hide the banner when app is installed
      setShowBanner(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // Check again after a short delay (in case the media query updates)
    const timeoutId = setTimeout(() => {
      if (!checkIfInstalled() && !deferredPrompt) {
        // Try to detect if we can prompt - some browsers don't fire beforeinstallprompt
        // We'll show the banner anyway with a manual trigger
        setShowBanner(true);
      }
    }, 3000);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Also listen for display-mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        setShowBanner(false);
      }
    };
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
      clearTimeout(timeoutId);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // If no deferred prompt, try to trigger the browser's install prompt
      // This handles browsers that don't fire beforeinstallprompt
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();
    
    // Wait for the user to respond
    const {outcome} = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowBanner(false);
      setIsInstalled(true);
    }
    
    // Clear the deferred prompt
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    // Remember that user dismissed the banner for this session
    localStorage.setItem('pwa-install-banner-dismissed', 'true');
  };

  // Don't show if installed or dismissed
  if (isInstalled || !showBanner || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 bg-white/20 p-2 rounded-lg">
            <Monitor className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm md:text-base truncate">
              Install ASMI App
            </h3>
            <p className="text-xs md:text-sm text-white/80 truncate">
              Add to home screen for quick access and offline support
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#1e3a5f] rounded-lg font-medium text-sm hover:bg-white/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
