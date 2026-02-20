import { useEffect } from 'react';

// ElevenLabs Conversational AI Widget
const ELEVENLABS_AGENT_ID = 'agent_6901khxn2e6xepn9qdcrkrcmjh71';

export function HelpWidget() {
  useEffect(() => {
    // Check if already loaded
    if (document.querySelector('elevenlabs-convai')) return;

    // Load the ElevenLabs script first
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    
    // After script loads, add the widget element
    script.onload = () => {
      const widget = document.createElement('elevenlabs-convai');
      widget.setAttribute('agent-id', ELEVENLABS_AGENT_ID);
      document.body.appendChild(widget);
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const widget = document.querySelector('elevenlabs-convai');
      if (widget?.parentNode) {
        widget.parentNode.removeChild(widget);
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null; // ElevenLabs injects its own UI
}

export default HelpWidget;
