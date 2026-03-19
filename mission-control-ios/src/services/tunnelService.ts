import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../store';

/**
 * Local Tunnel Service
 * Manages configuration and connection to local tunnels
 * Supports: ngrok, Cloudflare Tunnel, or custom tunnels
 * Features:
 * - Tunnel URL configuration
 * - Connection status monitoring
 * - Health checks
 * - Fallback to default API
 */

interface TunnelConfig {
  name: string;
  url: string;
  isActive: boolean;
  enabledAt?: string;
  testUrl?: string; // URL to test tunnel health
  type: 'ngrok' | 'cloudflare' | 'custom';
  description?: string;
}

interface TunnelStatus {
  isConnected: boolean;
  lastChecked: string;
  responseTime?: number;
  error?: string;
}

const STORAGE_KEY = 'mission_control_tunnel_config';
const TUNNEL_CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds
const TUNNEL_TIMEOUT = 5000;

class TunnelService {
  private config: TunnelConfig | null = null;
  private status: TunnelStatus = {
    isConnected: false,
    lastChecked: new Date().toISOString(),
  };
  private checkInterval: NodeJS.Timeout | null = null;
  private listeners: ((status: TunnelStatus) => void)[] = [];

  /**
   * Initialize tunnel service
   */
  async init() {
    try {
      await this.loadConfig();
      if (this.config?.isActive) {
        this.startHealthChecks();
      }
      console.log('[TunnelService] Initialized');
    } catch (error) {
      console.error('[TunnelService] Init failed:', error);
    }
  }

  /**
   * Load tunnel config from storage
   */
  private async loadConfig() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.config = JSON.parse(stored);
        console.log('[TunnelService] Loaded config:', this.config.name);
      }
    } catch (error) {
      console.error('[TunnelService] Failed to load config:', error);
    }
  }

  /**
   * Save tunnel config to storage
   */
  private async saveConfig() {
    try {
      if (this.config) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
        console.log('[TunnelService] Config saved');
      }
    } catch (error) {
      console.error('[TunnelService] Failed to save config:', error);
    }
  }

  /**
   * Configure tunnel URL
   */
  async setTunnelURL(url: string, type: 'ngrok' | 'cloudflare' | 'custom' = 'custom') {
    try {
      // Validate URL
      try {
        new URL(url);
      } catch {
        throw new Error('Invalid tunnel URL format');
      }

      this.config = {
        name: this.getTunnelName(type),
        url: url.endsWith('/') ? url.slice(0, -1) : url,
        isActive: true,
        type,
        enabledAt: new Date().toISOString(),
        testUrl: `${url}/api/status`,
      };

      await this.saveConfig();

      // Update API client
      const { apiClient } = await import('../api/apiClient');
      apiClient.setTunnelURL(this.config.url);

      // Test connection
      await this.checkHealth();

      // Start health checks
      if (this.checkInterval) clearInterval(this.checkInterval);
      this.startHealthChecks();

      console.log('[TunnelService] Tunnel configured:', this.config.name);
      return this.config;
    } catch (error) {
      console.error('[TunnelService] Failed to configure tunnel:', error);
      this.updateStatus({
        isConnected: false,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Disable tunnel (fallback to default API)
   */
  async disableTunnel() {
    try {
      if (this.config) {
        this.config.isActive = false;
      }

      if (this.checkInterval) {
        clearInterval(this.checkInterval);
      }

      // Reset API client to default
      const { apiClient } = await import('../api/apiClient');
      apiClient.setTunnelURL('');

      await this.saveConfig();

      this.updateStatus({
        isConnected: false,
        error: 'Tunnel disabled',
      });

      console.log('[TunnelService] Tunnel disabled');
    } catch (error) {
      console.error('[TunnelService] Failed to disable tunnel:', error);
    }
  }

  /**
   * Get current tunnel configuration
   */
  getConfig(): TunnelConfig | null {
    return this.config;
  }

  /**
   * Get tunnel connection status
   */
  getStatus(): TunnelStatus {
    return this.status;
  }

  /**
   * Check tunnel health
   */
  async checkHealth(): Promise<boolean> {
    if (!this.config?.isActive) {
      return false;
    }

    try {
      const testUrl = this.config.testUrl || `${this.config.url}/api/status`;
      const startTime = Date.now();

      const response = await fetch(testUrl, {
        method: 'GET',
        timeout: TUNNEL_TIMEOUT,
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        this.updateStatus({
          isConnected: true,
          responseTime,
        });
        console.log('[TunnelService] ✓ Health check passed', responseTime + 'ms');
        return true;
      } else {
        this.updateStatus({
          isConnected: false,
          error: `Health check failed: ${response.status}`,
        });
        console.log('[TunnelService] ✗ Health check failed:', response.status);
        return false;
      }
    } catch (error) {
      this.updateStatus({
        isConnected: false,
        error: error.message,
      });
      console.log('[TunnelService] ✗ Health check error:', error.message);
      return false;
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks() {
    // Immediate check
    this.checkHealth();

    // Periodic checks
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkHealth();
    }, TUNNEL_CHECK_INTERVAL);

    console.log('[TunnelService] Health checks started');
  }

  /**
   * Stop health checks
   */
  private stopHealthChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Update status and notify listeners
   */
  private updateStatus(updates: Partial<TunnelStatus>) {
    this.status = {
      ...this.status,
      ...updates,
      lastChecked: new Date().toISOString(),
    };

    this.listeners.forEach(listener => {
      try {
        listener(this.status);
      } catch (error) {
        console.error('[TunnelService] Listener error:', error);
      }
    });
  }

  /**
   * Subscribe to tunnel status changes
   */
  onStatusChange(listener: (status: TunnelStatus) => void) {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Get tunnel name based on type
   */
  private getTunnelName(type: string): string {
    switch (type) {
      case 'ngrok':
        return 'ngrok Tunnel';
      case 'cloudflare':
        return 'Cloudflare Tunnel';
      default:
        return 'Custom Tunnel';
    }
  }

  /**
   * Get list of preset tunnels (for UI suggestions)
   */
  getPresets() {
    return [
      {
        name: 'Local Development',
        url: 'http://localhost:3000',
        type: 'custom' as const,
        description: 'Local machine development server',
      },
      {
        name: 'ngrok Example',
        url: 'https://abc123.ngrok.io',
        type: 'ngrok' as const,
        description: 'Replace with your ngrok URL',
      },
      {
        name: 'Cloudflare Example',
        url: 'https://mission-control-api.elevationaiwork.com',
        type: 'cloudflare' as const,
        description: 'Replace with your Cloudflare tunnel URL',
      },
    ];
  }

  /**
   * Clear all tunnel configuration
   */
  async clear() {
    try {
      this.stopHealthChecks();
      this.config = null;
      this.listeners = [];
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('[TunnelService] Configuration cleared');
    } catch (error) {
      console.error('[TunnelService] Failed to clear:', error);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopHealthChecks();
    this.listeners = [];
  }
}

// Singleton instance
export const tunnelService = new TunnelService();

export { TunnelConfig, TunnelStatus };
export default tunnelService;
