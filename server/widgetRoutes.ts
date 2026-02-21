/**
 * Widget API Routes
 * 
 * These routes are called by the embeddable sm-widget.js
 * CORS enabled for all origins (widget runs on partner sites)
 */

import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { generateMessageImage } from "./imageGenerator";
import { sendMessageNotification, isValidEmail } from "./emailService";

// Rate limiting maps
const ipRateLimit = new Map<string, { count: number; resetAt: number }>();
const partnerRateLimit = new Map<string, { count: number; resetAt: number }>();

// Rate limit config
const IP_LIMIT = 10; // per minute
const PARTNER_LIMIT = 100; // per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

// CORS middleware for widget routes
export function widgetCors(req: Request, res: Response, next: NextFunction) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Partner-Id');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
}

// Rate limiting middleware
function rateLimit(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const ip = req.ip || req.headers['x-forwarded-for']?.toString().split(',')[0] || 'unknown';
  const partnerId = req.params.partnerId || req.body?.partner_id;
  
  // Check IP rate limit
  let ipData = ipRateLimit.get(ip);
  if (!ipData || now > ipData.resetAt) {
    ipData = { count: 0, resetAt: now + RATE_WINDOW };
    ipRateLimit.set(ip, ipData);
  }
  
  ipData.count++;
  if (ipData.count > IP_LIMIT) {
    const retryAfter = Math.ceil((ipData.resetAt - now) / 1000);
    res.setHeader('Retry-After', retryAfter.toString());
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment.',
      retry_after: retryAfter
    });
  }
  
  // Check partner rate limit
  if (partnerId) {
    let partnerData = partnerRateLimit.get(partnerId);
    if (!partnerData || now > partnerData.resetAt) {
      partnerData = { count: 0, resetAt: now + RATE_WINDOW };
      partnerRateLimit.set(partnerId, partnerData);
    }
    
    partnerData.count++;
    if (partnerData.count > PARTNER_LIMIT) {
      const retryAfter = Math.ceil((partnerData.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      return res.status(429).json({
        error: 'Rate limit exceeded.',
        retry_after: retryAfter
      });
    }
  }
  
  next();
}

// Sanitize input - strip HTML tags
function sanitizeInput(str: string): string {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

export function registerWidgetRoutes(app: Express) {
  // Apply CORS to all /v1/ routes
  app.use('/v1', widgetCors);
  
  // GET /v1/partners/:partnerId/widget-config
  // Returns partner's theme and pricing configuration
  app.get('/v1/partners/:partnerId/widget-config', rateLimit, async (req: Request, res: Response) => {
    try {
      const { partnerId } = req.params;
      
      // In a full implementation, this would fetch from the partners table
      // For now, we'll return a default config or look up by user ID
      
      // Try to find partner by ID (which might be a user ID)
      const partner = await storage.getUser(partnerId);
      
      if (!partner) {
        return res.status(404).json({
          error: 'Partner not found'
        });
      }
      
      // Build widget config from partner data
      // Partners can store widget_config in their user profile
      const widgetConfig = partner.widgetConfig ? JSON.parse(partner.widgetConfig as string) : {};
      
      res.json({
        partner_id: partnerId,
        theme: {
          accent: widgetConfig.accent || '#7c5cfc',
          background: widgetConfig.background || '#ffffff',
          text_color: widgetConfig.textColor || '#1a1a2e',
          radius: widgetConfig.radius || 12,
          title: widgetConfig.title || 'Send a Secret Message',
          subtitle: widgetConfig.subtitle || 'Only the recipient can unlock it',
          btn_text: widgetConfig.btnText || 'Send Secret Message',
          footer: widgetConfig.footer || ''
        },
        pricing: {
          default_price: widgetConfig.defaultPrice || 2.99,
          allow_custom_price: widgetConfig.allowCustomPrice || false,
          min_price: widgetConfig.minPrice || 0.99,
          max_price: widgetConfig.maxPrice || 99.99
        },
        content_flag: 'standard',
        status: partner.status === 'suspended' ? 'suspended' : 'active'
      });
    } catch (error: any) {
      console.error('Error fetching widget config:', error);
      res.status(500).json({
        error: 'Failed to load configuration'
      });
    }
  });
  
  // POST /v1/messages
  // Creates a new secret message via widget
  app.post('/v1/messages', rateLimit, async (req: Request, res: Response) => {
    try {
      const { partner_id, content, sender_email, price, currency, metadata } = req.body;
      
      // Validate required fields
      if (!partner_id) {
        return res.status(400).json({ error: 'partner_id is required' });
      }
      
      if (!content) {
        return res.status(400).json({ error: 'content is required' });
      }
      
      // Validate partner
      const partner = await storage.getUser(partner_id);
      if (!partner) {
        return res.status(400).json({ error: 'Invalid partner_id' });
      }
      
      // Sanitize content
      const sanitizedContent = sanitizeInput(content);
      if (sanitizedContent.length === 0) {
        return res.status(400).json({ error: 'Message content cannot be empty' });
      }
      
      if (sanitizedContent.length > 5000) {
        return res.status(400).json({ error: 'Message content too long (max 5000 characters)' });
      }
      
      // Validate email if provided
      if (sender_email && !isValidEmail(sender_email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      
      // Validate price
      const finalPrice = parseFloat(price) || 2.99;
      const widgetConfig = partner.widgetConfig ? JSON.parse(partner.widgetConfig as string) : {};
      const minPrice = widgetConfig.minPrice || 0.99;
      const maxPrice = widgetConfig.maxPrice || 99.99;
      
      if (finalPrice < minPrice || finalPrice > maxPrice) {
        return res.status(400).json({
          error: `Price must be between $${minPrice} and $${maxPrice}`
        });
      }
      
      // Create the message
      // Note: Using the partner's user ID as the sender, content as messageBody
      // The recipientIdentifier can be empty or sender_email for now
      const message = await storage.createMessage(partner_id, {
        title: 'Secret Message',
        messageBody: sanitizedContent,
        recipientIdentifier: sender_email || 'anonymous',
        price: finalPrice.toFixed(2),
        expiresAt: undefined
      });
      
      // Generate preview image
      try {
        const imageUrl = await generateMessageImage(sanitizedContent, message.id);
        await storage.updateMessageImage(message.id, imageUrl);
      } catch (imageError) {
        console.error('Error generating image:', imageError);
        // Continue without image
      }
      
      // Build unlock URL
      const unlockUrl = `https://secretmessage4u.com/m/${message.slug}`;
      
      // Send notification email if sender provided email
      if (sender_email && isValidEmail(sender_email)) {
        try {
          // Could send a receipt email to sender here
          console.log(`Widget message created by ${sender_email}`);
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      }
      
      res.status(201).json({
        id: message.id,
        unlock_url: unlockUrl,
        status: 'awaiting_payment',
        price: parseFloat(message.price),
        created_at: message.createdAt
      });
      
    } catch (error: any) {
      console.error('Error creating widget message:', error);
      res.status(500).json({
        error: 'Failed to create message'
      });
    }
  });
  
  // GET /v1/messages/:messageId/status
  // Check message status (for polling if needed)
  app.get('/v1/messages/:messageId/status', rateLimit, async (req: Request, res: Response) => {
    try {
      const { messageId } = req.params;
      
      // Try to find by slug or ID
      let message = await storage.getMessageBySlug(messageId);
      if (!message) {
        message = await storage.getMessageById(messageId);
      }
      
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
      
      res.json({
        id: message.id,
        status: message.unlocked ? 'unlocked' : 'awaiting_payment',
        unlocked: message.unlocked
      });
    } catch (error: any) {
      console.error('Error fetching message status:', error);
      res.status(500).json({
        error: 'Failed to fetch status'
      });
    }
  });
  
  // Serve widget static files
  const widgetDir = process.env.NODE_ENV === 'production' 
    ? './dist/public/widget/v1'
    : './public/widget/v1';
  
  // Serve the widget JavaScript
  app.get('/widget/v1/sm-widget.js', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile('sm-widget.js', { root: widgetDir });
  });
  
  // Serve minified widget
  app.get('/widget/v1/sm-widget.min.js', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile('sm-widget.min.js', { root: widgetDir });
  });
  
  // Serve test page
  app.get('/widget/v1/test.html', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile('test.html', { root: widgetDir });
  });
  
  // Redirect /widget/v1/ to test page
  app.get('/widget/v1/', (req: Request, res: Response) => {
    res.redirect('/widget/v1/test.html');
  });
}
