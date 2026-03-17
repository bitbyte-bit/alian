import {useState, useEffect, useCallback} from 'react';
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
  const [isIOS, setIsIOS] = useState(false);

  const checkIfInstalled = useCallback(() => {
    // Check if the app is already installed using CSS media query
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppMode = (window.navigator as {standalone?: boolean}).standalone === true;
    const isInStandaloneMode = window.matchMedia('(display-mode: minimal-ui)').matches;
    
    if (isStandalone || isInWebAppMode || isInStandaloneMode) {
      setIsInstalled(true);
      setShowBanner(false);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Initial check
    if (checkIfInstalled()) {
      return;
    }

    // Check if user previously dismissed the banner
    const dismissed = localStorage.getItem('pwa-install-banner-dismissed');
    const dismissedTime = localStorage.getItem('pwa-install-banner-dismissed-time');
    
    // If dismissed, only show again after 24 hours
    if (dismissed && dismissedTime) {
      const dismissedDate = parseInt(dismissedTime);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (now - dismissedDate < oneDay) {
        setIsDismissed(true);
        return;
      } else {
        // Reset after 24 hours
        localStorage.removeItem('pwa-install-banner-dismissed');
        localStorage.removeItem('pwa-install-banner-dismissed-time');
      }
    }

    // Listen for the beforeinstallprompt event (Chrome, Edge, Opera)
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

    // Also listen for display-mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        setShowBanner(false);
      }
    };
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    // Also check minimal-ui mode
    const mediaQueryMinimal = window.matchMedia('(display-mode: minimal-ui)');
    const handleDisplayModeChangeMinimal = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        setShowBanner(false);
      }
    };
    mediaQueryMinimal.addEventListener('change', handleDisplayModeChangeMinimal);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show banner for iOS users with a prompt to add to home screen
    if (iOS) {
      // iOS doesn't fire beforeinstallprompt, so we show instructions
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
      mediaQueryMinimal.removeEventListener('change', handleDisplayModeChangeMinimal);
    };
  }, [checkIfInstalled]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Show the install prompt (Android/Chrome)
      await deferredPrompt.prompt();
      
      // Wait for the user to respond
      const {outcome} = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowBanner(false);
        setIsInstalled(true);
      }
      
      // Clear the deferred prompt
      setDeferredPrompt(null);
    } else if (isIOS) {
      // For iOS, show instructions to add to home screen
      alert('To install this app:\n\n1. Tap the Share button in Safari\n2. Tap "Add to Home Screen"\n3. Tap "Add"');
    } else {
      // Try to find and click the install prompt programmatically
      // This is a fallback for browsers that don't fire beforeinstallprompt
      const installButtons = document.querySelectorAll('[data-pwa-install]');
      if (installButtons.length > 0) {
        (installButtons[0] as HTMLButtonElement).click();
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    // Remember that user dismissed the banner for this session
    localStorage.setItem('pwa-install-banner-dismissed', 'true');
    localStorage.setItem('pwa-install-banner-dismissed-time', Date.now().toString());
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
              {isIOS ? 'Add ASMI to Home Screen' : 'Install ASMI App'}
            </h3>
            <p className="text-xs md:text-sm text-white/80 truncate">
              {isIOS 
                ? 'Tap Share, then Add to Home Screen for quick access' 
                : 'Add to home screen for quick access and offline support'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#1e3a5f] rounded-lg font-medium text-sm hover:bg-white/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{isIOS ? 'How to Install' : 'Install'}</span>
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
