/**
 * SecretMessage4U Widget
 * Embeddable white-label widget for secret message creation
 * 
 * @version 1.0.0
 * @license MIT
 */
(function() {
  'use strict';

  // ==========================================================================
  // Configuration
  // ==========================================================================
  
  const API_BASE = 'https://secretmessage4u.com';
  const DEFAULT_CONFIG = {
    mode: 'inline',
    target: '#secret-message-widget',
    trigger: null,
    theme: {
      accent: '#7c5cfc',
      background: '#ffffff',
      textColor: '#1a1a2e',
      radius: 12,
      title: 'Send a Secret Message',
      subtitle: 'Only the recipient can unlock it',
      btnText: 'Send Secret Message',
      footer: ''
    },
    pricing: {
      defaultPrice: 2.99,
      allowCustomPrice: false,
      minPrice: 0.99,
      maxPrice: 99.99
    }
  };

  // ==========================================================================
  // Styles (injected into Shadow DOM)
  // ==========================================================================
  
  const WIDGET_STYLES = `
    :host {
      --sm-accent: #7c5cfc;
      --sm-accent-hover: #6b4ce0;
      --sm-bg: #ffffff;
      --sm-text: #1a1a2e;
      --sm-text-dim: #6b6b80;
      --sm-border: #e1e1e6;
      --sm-error: #e53e3e;
      --sm-success: #38a169;
      --sm-radius: 12px;
      --sm-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      
      display: block;
      font-family: var(--sm-font);
      font-size: 16px;
      line-height: 1.5;
      color: var(--sm-text);
    }
    
    *, *::before, *::after {
      box-sizing: border-box;
    }
    
    .sm-widget {
      background: var(--sm-bg);
      border-radius: var(--sm-radius);
      padding: 24px;
      max-width: 400px;
      margin: 0 auto;
    }
    
    .sm-widget--modal {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    
    .sm-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 4px 0;
      color: var(--sm-text);
    }
    
    .sm-subtitle {
      font-size: 0.875rem;
      color: var(--sm-text-dim);
      margin: 0 0 20px 0;
    }
    
    .sm-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .sm-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .sm-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--sm-text);
    }
    
    .sm-textarea {
      width: 100%;
      min-height: 100px;
      max-height: 200px;
      padding: 12px;
      border: 1px solid var(--sm-border);
      border-radius: calc(var(--sm-radius) / 2);
      font-family: inherit;
      font-size: 1rem;
      resize: vertical;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .sm-textarea:focus {
      outline: none;
      border-color: var(--sm-accent);
      box-shadow: 0 0 0 3px rgba(124, 92, 252, 0.1);
    }
    
    .sm-textarea::placeholder {
      color: var(--sm-text-dim);
    }
    
    .sm-input {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--sm-border);
      border-radius: calc(var(--sm-radius) / 2);
      font-family: inherit;
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .sm-input:focus {
      outline: none;
      border-color: var(--sm-accent);
      box-shadow: 0 0 0 3px rgba(124, 92, 252, 0.1);
    }
    
    .sm-input::placeholder {
      color: var(--sm-text-dim);
    }
    
    .sm-input--error,
    .sm-textarea--error {
      border-color: var(--sm-error);
    }
    
    .sm-error-text {
      font-size: 0.75rem;
      color: var(--sm-error);
      margin-top: 4px;
    }
    
    .sm-price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-top: 1px solid var(--sm-border);
      border-bottom: 1px solid var(--sm-border);
    }
    
    .sm-price-label {
      font-size: 0.875rem;
      color: var(--sm-text-dim);
    }
    
    .sm-price-value {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--sm-text);
    }
    
    .sm-btn {
      width: 100%;
      padding: 14px 24px;
      background: var(--sm-accent);
      color: white;
      border: none;
      border-radius: calc(var(--sm-radius) / 2);
      font-family: inherit;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.1s;
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .sm-btn:hover:not(:disabled) {
      background: var(--sm-accent-hover);
    }
    
    .sm-btn:active:not(:disabled) {
      transform: scale(0.98);
    }
    
    .sm-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .sm-btn--loading .sm-btn-text {
      visibility: hidden;
    }
    
    .sm-spinner {
      position: absolute;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: sm-spin 0.8s linear infinite;
    }
    
    @keyframes sm-spin {
      to { transform: rotate(360deg); }
    }
    
    .sm-footer {
      text-align: center;
      margin-top: 16px;
    }
    
    .sm-footer-text {
      font-size: 0.75rem;
      color: var(--sm-text-dim);
    }
    
    .sm-no-account {
      font-size: 0.8125rem;
      color: var(--sm-text-dim);
      text-align: center;
      margin-top: 12px;
    }
    
    /* Success State */
    .sm-success {
      text-align: center;
      padding: 20px 0;
    }
    
    .sm-success-icon {
      width: 64px;
      height: 64px;
      background: var(--sm-success);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }
    
    .sm-success-icon svg {
      width: 32px;
      height: 32px;
      color: white;
    }
    
    .sm-success-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 8px 0;
    }
    
    .sm-success-subtitle {
      font-size: 0.875rem;
      color: var(--sm-text-dim);
      margin: 0 0 20px 0;
    }
    
    .sm-url-box {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #f5f5f7;
      border-radius: calc(var(--sm-radius) / 2);
      margin-bottom: 16px;
    }
    
    .sm-url-text {
      flex: 1;
      font-size: 0.875rem;
      color: var(--sm-text);
      word-break: break-all;
      text-align: left;
    }
    
    .sm-copy-btn {
      padding: 8px;
      background: transparent;
      border: none;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    
    .sm-copy-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    
    .sm-copy-btn svg {
      width: 20px;
      height: 20px;
      color: var(--sm-text-dim);
    }
    
    .sm-price-note {
      font-size: 0.875rem;
      color: var(--sm-text-dim);
      margin-bottom: 20px;
    }
    
    .sm-btn--secondary {
      background: transparent;
      color: var(--sm-accent);
      border: 1px solid var(--sm-accent);
    }
    
    .sm-btn--secondary:hover:not(:disabled) {
      background: rgba(124, 92, 252, 0.05);
    }
    
    /* Modal Overlay */
    .sm-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      padding: 20px;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s, visibility 0.2s;
    }
    
    .sm-modal-overlay--open {
      opacity: 1;
      visibility: visible;
    }
    
    .sm-modal-content {
      transform: scale(0.95);
      transition: transform 0.2s;
    }
    
    .sm-modal-overlay--open .sm-modal-content {
      transform: scale(1);
    }
    
    .sm-modal-close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      background: transparent;
      border: none;
      cursor: pointer;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    
    .sm-modal-close:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    
    .sm-modal-close svg {
      width: 20px;
      height: 20px;
      color: var(--sm-text-dim);
    }
    
    /* Loading Skeleton */
    .sm-skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: sm-shimmer 1.5s infinite;
      border-radius: 4px;
    }
    
    @keyframes sm-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    .sm-skeleton-title {
      height: 24px;
      width: 70%;
      margin-bottom: 8px;
    }
    
    .sm-skeleton-subtitle {
      height: 16px;
      width: 50%;
      margin-bottom: 20px;
    }
    
    .sm-skeleton-textarea {
      height: 100px;
      margin-bottom: 16px;
    }
    
    .sm-skeleton-input {
      height: 48px;
      margin-bottom: 16px;
    }
    
    .sm-skeleton-btn {
      height: 48px;
    }
    
    /* Error State */
    .sm-error-state {
      text-align: center;
      padding: 40px 20px;
    }
    
    .sm-error-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .sm-error-state-text {
      color: var(--sm-text-dim);
      margin-bottom: 16px;
    }
    
    /* Responsive */
    @media (max-width: 380px) {
      .sm-widget {
        padding: 16px;
      }
      
      .sm-btn {
        min-height: 52px;
      }
    }
  `;

  // ==========================================================================
  // Utility Functions
  // ==========================================================================
  
  function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  function formatPrice(price) {
    return '$' + parseFloat(price).toFixed(2);
  }
  
  function generateId() {
    return 'sm-' + Math.random().toString(36).substr(2, 9);
  }

  // ==========================================================================
  // API Client
  // ==========================================================================
  
  const api = {
    async getPartnerConfig(partnerId) {
      const response = await fetch(`${API_BASE}/v1/partners/${partnerId}/widget-config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Partner not found');
        }
        throw new Error('Failed to load widget configuration');
      }
      
      return response.json();
    },
    
    async createMessage(data) {
      const response = await fetch(`${API_BASE}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error('Please wait a moment before sending another message.');
        }
        throw new Error(error.message || 'Failed to send message');
      }
      
      return response.json();
    }
  };

  // ==========================================================================
  // Widget Class
  // ==========================================================================
  
  class SecretMessageWidgetInstance {
    constructor(config) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.partnerId = config.partnerId;
      this.mode = config.mode || 'inline';
      this.target = config.target;
      this.trigger = config.trigger;
      this.callbacks = config.callbacks || {};
      this.partnerConfig = null;
      this.root = null;
      this.shadowRoot = null;
      this.isLoading = false;
      this.isSubmitting = false;
      this.isSuccess = false;
      this.successData = null;
      
      this.init();
    }
    
    async init() {
      try {
        // Create container and shadow DOM
        this.createContainer();
        
        // Show loading state
        this.renderLoading();
        
        // Fetch partner config
        this.partnerConfig = await api.getPartnerConfig(this.partnerId);
        
        // Check if partner is active
        if (this.partnerConfig.status !== 'active') {
          this.renderDisabled();
          return;
        }
        
        // Merge configs (data attributes override API config)
        this.mergeConfig();
        
        // Render the widget
        this.render();
        
        // Setup modal if needed
        if (this.mode === 'modal') {
          this.setupModal();
        }
        
        // Fire ready callback
        if (this.callbacks.onReady) {
          this.callbacks.onReady();
        }
      } catch (error) {
        console.error('[SM Widget] Init error:', error);
        this.renderError(error.message);
        
        if (this.callbacks.onError) {
          this.callbacks.onError({ code: 'init_error', message: error.message });
        }
      }
    }
    
    createContainer() {
      if (this.mode === 'inline') {
        const targetEl = document.querySelector(this.target);
        if (!targetEl) {
          throw new Error(`Target element not found: ${this.target}`);
        }
        this.root = document.createElement('div');
        this.root.id = generateId();
        targetEl.appendChild(this.root);
      } else {
        // Modal mode - create hidden container
        this.root = document.createElement('div');
        this.root.id = generateId();
        document.body.appendChild(this.root);
      }
      
      // Create Shadow DOM
      this.shadowRoot = this.root.attachShadow({ mode: 'open' });
      
      // Inject styles
      const styleEl = document.createElement('style');
      styleEl.textContent = WIDGET_STYLES;
      this.shadowRoot.appendChild(styleEl);
    }
    
    mergeConfig() {
      const pc = this.partnerConfig;
      const theme = this.config.theme || {};
      
      this.theme = {
        accent: this.config.accent || theme.accent || pc.theme?.accent || DEFAULT_CONFIG.theme.accent,
        background: this.config.bg || theme.background || pc.theme?.background || DEFAULT_CONFIG.theme.background,
        textColor: this.config.textColor || theme.textColor || pc.theme?.text_color || DEFAULT_CONFIG.theme.textColor,
        radius: this.config.radius || theme.radius || pc.theme?.radius || DEFAULT_CONFIG.theme.radius,
        title: this.config.title || theme.title || pc.theme?.title || DEFAULT_CONFIG.theme.title,
        subtitle: this.config.subtitle || theme.subtitle || pc.theme?.subtitle || DEFAULT_CONFIG.theme.subtitle,
        btnText: this.config.btnText || theme.btnText || pc.theme?.btn_text || DEFAULT_CONFIG.theme.btnText,
        footer: this.config.footer !== undefined ? this.config.footer : (theme.footer || pc.theme?.footer || '')
      };
      
      this.pricing = {
        defaultPrice: this.config.price || pc.pricing?.default_price || DEFAULT_CONFIG.pricing.defaultPrice,
        allowCustomPrice: pc.pricing?.allow_custom_price || DEFAULT_CONFIG.pricing.allowCustomPrice,
        minPrice: pc.pricing?.min_price || DEFAULT_CONFIG.pricing.minPrice,
        maxPrice: pc.pricing?.max_price || DEFAULT_CONFIG.pricing.maxPrice
      };
    }
    
    applyThemeVariables(container) {
      container.style.setProperty('--sm-accent', this.theme.accent);
      container.style.setProperty('--sm-bg', this.theme.background);
      container.style.setProperty('--sm-text', this.theme.textColor);
      container.style.setProperty('--sm-radius', this.theme.radius + 'px');
      
      // Calculate accent hover color (slightly darker)
      const hex = this.theme.accent.replace('#', '');
      const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 20);
      const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 20);
      const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 20);
      container.style.setProperty('--sm-accent-hover', `rgb(${r}, ${g}, ${b})`);
    }
    
    renderLoading() {
      const container = document.createElement('div');
      container.className = 'sm-widget';
      container.innerHTML = `
        <div class="sm-skeleton sm-skeleton-title"></div>
        <div class="sm-skeleton sm-skeleton-subtitle"></div>
        <div class="sm-skeleton sm-skeleton-textarea"></div>
        <div class="sm-skeleton sm-skeleton-input"></div>
        <div class="sm-skeleton sm-skeleton-btn"></div>
      `;
      this.shadowRoot.appendChild(container);
    }
    
    renderDisabled() {
      this.clearContent();
      const container = document.createElement('div');
      container.className = 'sm-widget';
      container.innerHTML = `
        <div class="sm-error-state">
          <div class="sm-error-state-icon">🔒</div>
          <p class="sm-error-state-text">This widget is currently unavailable.</p>
        </div>
      `;
      this.applyThemeVariables(container);
      this.shadowRoot.appendChild(container);
    }
    
    renderError(message) {
      this.clearContent();
      const container = document.createElement('div');
      container.className = 'sm-widget';
      container.innerHTML = `
        <div class="sm-error-state">
          <div class="sm-error-state-icon">⚠️</div>
          <p class="sm-error-state-text">${sanitizeHTML(message)}</p>
          <button class="sm-btn sm-btn--secondary" id="sm-retry-btn">Try Again</button>
        </div>
      `;
      this.shadowRoot.appendChild(container);
      
      container.querySelector('#sm-retry-btn').addEventListener('click', () => {
        this.init();
      });
    }
    
    clearContent() {
      // Remove all children except style
      const children = Array.from(this.shadowRoot.children);
      children.forEach(child => {
        if (child.tagName !== 'STYLE') {
          child.remove();
        }
      });
    }
    
    render() {
      this.clearContent();
      
      if (this.isSuccess) {
        this.renderSuccess();
        return;
      }
      
      const container = document.createElement('div');
      container.className = 'sm-widget' + (this.mode === 'modal' ? ' sm-widget--modal' : '');
      
      container.innerHTML = `
        <h2 class="sm-title">${sanitizeHTML(this.theme.title)}</h2>
        <p class="sm-subtitle">${sanitizeHTML(this.theme.subtitle)}</p>
        
        <form class="sm-form" id="sm-form">
          <div class="sm-field">
            <label class="sm-label" for="sm-message">Your secret message</label>
            <textarea 
              class="sm-textarea" 
              id="sm-message" 
              name="message"
              placeholder="Type your secret message..."
              maxlength="5000"
              rows="4"
              required
              aria-describedby="sm-message-error"
            ></textarea>
            <span class="sm-error-text" id="sm-message-error" style="display: none;"></span>
          </div>
          
          <div class="sm-field">
            <label class="sm-label" for="sm-email">Your email (for receipt)</label>
            <input 
              type="email" 
              class="sm-input" 
              id="sm-email" 
              name="email"
              placeholder="your@email.com"
              aria-describedby="sm-email-error"
            />
            <span class="sm-error-text" id="sm-email-error" style="display: none;"></span>
          </div>
          
          <div class="sm-price-row">
            <span class="sm-price-label">Unlock price</span>
            <span class="sm-price-value">${formatPrice(this.pricing.defaultPrice)}</span>
          </div>
          
          <button type="submit" class="sm-btn" id="sm-submit-btn" aria-busy="false">
            <span class="sm-btn-text">${sanitizeHTML(this.theme.btnText)}</span>
            <span class="sm-spinner" style="display: none;"></span>
          </button>
        </form>
        
        <p class="sm-no-account">No account needed</p>
        ${this.theme.footer ? `<div class="sm-footer"><span class="sm-footer-text">${sanitizeHTML(this.theme.footer)}</span></div>` : ''}
      `;
      
      this.applyThemeVariables(container);
      this.shadowRoot.appendChild(container);
      
      // Setup form handling
      this.setupForm(container);
    }
    
    renderSuccess() {
      this.clearContent();
      
      const container = document.createElement('div');
      container.className = 'sm-widget' + (this.mode === 'modal' ? ' sm-widget--modal' : '');
      
      container.innerHTML = `
        <div class="sm-success">
          <div class="sm-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 class="sm-success-title">Message Sent!</h2>
          <p class="sm-success-subtitle">Share this link with your recipient:</p>
          
          <div class="sm-url-box">
            <span class="sm-url-text" id="sm-unlock-url">${this.successData.unlock_url}</span>
            <button class="sm-copy-btn" id="sm-copy-btn" title="Copy link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
          
          <p class="sm-price-note">They'll pay ${formatPrice(this.successData.price)} to unlock.</p>
          
          <button class="sm-btn sm-btn--secondary" id="sm-send-another">Send Another</button>
        </div>
      `;
      
      this.applyThemeVariables(container);
      this.shadowRoot.appendChild(container);
      
      // Copy button handler
      container.querySelector('#sm-copy-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(this.successData.unlock_url).then(() => {
          const btn = container.querySelector('#sm-copy-btn');
          btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `;
          setTimeout(() => {
            btn.innerHTML = `
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            `;
          }, 2000);
        });
      });
      
      // Send another handler
      container.querySelector('#sm-send-another').addEventListener('click', () => {
        this.isSuccess = false;
        this.successData = null;
        this.render();
      });
    }
    
    setupForm(container) {
      const form = container.querySelector('#sm-form');
      const messageInput = container.querySelector('#sm-message');
      const emailInput = container.querySelector('#sm-email');
      const submitBtn = container.querySelector('#sm-submit-btn');
      
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        // Validate
        const message = messageInput.value.trim();
        const email = emailInput.value.trim();
        let hasErrors = false;
        
        // Reset errors
        this.clearFieldError(container, 'sm-message');
        this.clearFieldError(container, 'sm-email');
        
        if (!message) {
          this.showFieldError(container, 'sm-message', 'Please enter a message');
          hasErrors = true;
        }
        
        if (email && !validateEmail(email)) {
          this.showFieldError(container, 'sm-email', 'Please enter a valid email');
          hasErrors = true;
        }
        
        if (hasErrors) return;
        
        // Submit
        this.isSubmitting = true;
        submitBtn.classList.add('sm-btn--loading');
        submitBtn.querySelector('.sm-spinner').style.display = 'block';
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.disabled = true;
        
        try {
          const result = await api.createMessage({
            partner_id: this.partnerId,
            content: message,
            sender_email: email || null,
            price: this.pricing.defaultPrice,
            currency: 'USD',
            metadata: {}
          });
          
          this.isSuccess = true;
          this.successData = result;
          this.render();
          
          if (this.callbacks.onMessageCreated) {
            this.callbacks.onMessageCreated(result);
          }
        } catch (error) {
          console.error('[SM Widget] Submit error:', error);
          
          // Show error below form
          const existingError = container.querySelector('.sm-form-error');
          if (existingError) existingError.remove();
          
          const errorDiv = document.createElement('div');
          errorDiv.className = 'sm-form-error';
          errorDiv.style.cssText = 'color: var(--sm-error); text-align: center; margin-top: 12px; font-size: 0.875rem;';
          errorDiv.textContent = error.message || 'Something went wrong. Please try again.';
          form.appendChild(errorDiv);
          
          if (this.callbacks.onError) {
            this.callbacks.onError({ code: 'submit_error', message: error.message });
          }
        } finally {
          this.isSubmitting = false;
          submitBtn.classList.remove('sm-btn--loading');
          submitBtn.querySelector('.sm-spinner').style.display = 'none';
          submitBtn.setAttribute('aria-busy', 'false');
          submitBtn.disabled = false;
        }
      });
    }
    
    showFieldError(container, fieldId, message) {
      const input = container.querySelector(`#${fieldId}`);
      const error = container.querySelector(`#${fieldId}-error`);
      
      if (input) {
        input.classList.add(input.tagName === 'TEXTAREA' ? 'sm-textarea--error' : 'sm-input--error');
      }
      if (error) {
        error.textContent = message;
        error.style.display = 'block';
      }
    }
    
    clearFieldError(container, fieldId) {
      const input = container.querySelector(`#${fieldId}`);
      const error = container.querySelector(`#${fieldId}-error`);
      
      if (input) {
        input.classList.remove('sm-textarea--error', 'sm-input--error');
      }
      if (error) {
        error.textContent = '';
        error.style.display = 'none';
      }
    }
    
    setupModal() {
      // Create modal overlay
      this.modalOverlay = document.createElement('div');
      this.modalOverlay.className = 'sm-modal-overlay';
      this.modalOverlay.innerHTML = `
        <div class="sm-modal-content" style="position: relative;">
          <button class="sm-modal-close" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;
      
      // Move widget content into modal
      const widget = this.shadowRoot.querySelector('.sm-widget');
      if (widget) {
        this.modalOverlay.querySelector('.sm-modal-content').appendChild(widget);
      }
      
      // Clear and add modal to shadow root
      this.clearContent();
      this.shadowRoot.appendChild(this.modalOverlay);
      
      // Close button handler
      this.modalOverlay.querySelector('.sm-modal-close').addEventListener('click', () => {
        this.close();
      });
      
      // Close on overlay click
      this.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) {
          this.close();
        }
      });
      
      // Close on Escape key
      this.escHandler = (e) => {
        if (e.key === 'Escape' && this.modalOverlay.classList.contains('sm-modal-overlay--open')) {
          this.close();
        }
      };
      document.addEventListener('keydown', this.escHandler);
      
      // Setup trigger button
      if (this.trigger) {
        const triggerEl = document.querySelector(this.trigger);
        if (triggerEl) {
          triggerEl.addEventListener('click', () => {
            this.open();
          });
        }
      }
    }
    
    open() {
      if (this.mode !== 'modal' || !this.modalOverlay) return;
      
      this.modalOverlay.classList.add('sm-modal-overlay--open');
      document.body.style.overflow = 'hidden';
      
      // Focus first input
      setTimeout(() => {
        const firstInput = this.shadowRoot.querySelector('.sm-textarea, .sm-input');
        if (firstInput) firstInput.focus();
      }, 100);
      
      if (this.callbacks.onModalOpen) {
        this.callbacks.onModalOpen();
      }
    }
    
    close() {
      if (this.mode !== 'modal' || !this.modalOverlay) return;
      
      this.modalOverlay.classList.remove('sm-modal-overlay--open');
      document.body.style.overflow = '';
      
      if (this.callbacks.onModalClose) {
        this.callbacks.onModalClose();
      }
    }
    
    destroy() {
      // Remove event listeners
      if (this.escHandler) {
        document.removeEventListener('keydown', this.escHandler);
      }
      
      // Remove DOM elements
      if (this.root) {
        this.root.remove();
      }
      
      // Clear references
      this.root = null;
      this.shadowRoot = null;
      this.modalOverlay = null;
    }
  }

  // ==========================================================================
  // Public API
  // ==========================================================================
  
  const SecretMessageWidget = {
    instances: [],
    
    init(config) {
      if (!config.partnerId) {
        console.error('[SM Widget] partnerId is required');
        return null;
      }
      
      const instance = new SecretMessageWidgetInstance(config);
      this.instances.push(instance);
      return instance;
    },
    
    destroyAll() {
      this.instances.forEach(instance => instance.destroy());
      this.instances = [];
    }
  };
  
  // Expose to window
  window.SecretMessageWidget = SecretMessageWidget;

  // ==========================================================================
  // Auto-initialization from script tag
  // ==========================================================================
  
  function autoInit() {
    const script = document.currentScript || document.querySelector('script[data-partner-id]');
    if (!script || !script.dataset.partnerId) return;
    
    const config = {
      partnerId: script.dataset.partnerId,
      mode: script.dataset.mode || 'inline',
      target: script.dataset.target || '#secret-message-widget',
      trigger: script.dataset.trigger || null,
      accent: script.dataset.accent,
      bg: script.dataset.bg,
      textColor: script.dataset.textColor,
      radius: script.dataset.radius ? parseInt(script.dataset.radius, 10) : null,
      title: script.dataset.title,
      subtitle: script.dataset.subtitle,
      btnText: script.dataset.btnText,
      price: script.dataset.price ? parseFloat(script.dataset.price) : null,
      footer: script.dataset.footer
    };
    
    // Clean up undefined values
    Object.keys(config).forEach(key => {
      if (config[key] === undefined || config[key] === null) {
        delete config[key];
      }
    });
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        SecretMessageWidget.init(config);
      });
    } else {
      SecretMessageWidget.init(config);
    }
  }
  
  autoInit();
  
})();
