export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '1243615707466457';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

/**
 * Trigger PageView Meta Pixel Event
 */
export const pageview = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

/**
 * Trigger Standard Meta Pixel Events
 * @param name Event name (ViewContent, AddToCart, InitiateCheckout, Purchase, etc.)
 * @param options Event payload parameters
 */
export const event = (name: string, options: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', name, options);
  }
};
