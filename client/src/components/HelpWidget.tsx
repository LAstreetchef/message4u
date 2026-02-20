import { useEffect } from 'react';

// Crisp Chat Widget
// Sign up free at https://crisp.chat and get your Website ID
// Then set VITE_CRISP_WEBSITE_ID in your environment

declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}

export function HelpWidget() {
  useEffect(() => {
    const websiteId = import.meta.env.VITE_CRISP_WEBSITE_ID;
    
    if (!websiteId) {
      console.log('Crisp: No VITE_CRISP_WEBSITE_ID set, chat widget disabled');
      return;
    }

    // Initialize Crisp
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = websiteId;

    const script = document.createElement('script');
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null; // Crisp injects its own UI
}

export default HelpWidget;
