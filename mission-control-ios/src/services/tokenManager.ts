import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useStore } from '../store';

/**
 * JWT Token Manager
 * Handles:
 * - Token storage (secure)
 * - Token refresh cycles
 * - Token expiration tracking
 * - Automatic refresh before expiration
 */

interface TokenPayload {
  exp: number;
  iat: number;
  sub: string;
  [key: string]: any;
}

interface TokenSet {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
}

const SECURE_STORAGE_KEYS = {
  ACCESS_TOKEN: 'mission_control_access_token',
  REFRESH_TOKEN: 'mission_control_refresh_token',
  TOKEN_EXPIRES_AT: 'mission_control_token_expires_at',
};

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // Refresh 5 min before expiry

class TokenManager {
  private refreshPromise: Promise<boolean> | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize token manager with stored tokens
   */
  async init() {
    try {
      const token = await this.getAccessToken();
      const expiresAt = await this.getExpiresAt();

      if (token && expiresAt) {
        const msUntilExpiry = expiresAt - Date.now();

        if (msUntilExpiry > 0) {
          // Schedule refresh before expiration
          this.scheduleTokenRefresh(msUntilExpiry);
        } else {
          // Token expired, try to refresh
          await this.refreshToken();
        }
      }
    } catch (error) {
      console.error('[TokenManager] Init failed:', error);
    }
  }

  /**
   * Store tokens securely
   */
  async setTokens(tokens: TokenSet) {
    try {
      await SecureStore.setItemAsync(SECURE_STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      await SecureStore.setItemAsync(SECURE_STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

      const expiresAt = Date.now() + tokens.expiresIn * 1000;
      await AsyncStorage.setItem(
        SECURE_STORAGE_KEYS.TOKEN_EXPIRES_AT,
        expiresAt.toString()
      );

      // Update store
      useStore.setState({ authToken: tokens.accessToken });

      // Schedule next refresh
      this.scheduleTokenRefresh(tokens.expiresIn * 1000 - REFRESH_THRESHOLD_MS);

      console.log('[TokenManager] Tokens stored, refresh in', tokens.expiresIn, 'seconds');
    } catch (error) {
      console.error('[TokenManager] Failed to store tokens:', error);
      throw error;
    }
  }

  /**
   * Get access token (returns valid token or null)
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(SECURE_STORAGE_KEYS.ACCESS_TOKEN);
      return token || null;
    } catch (error) {
      console.error('[TokenManager] Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(SECURE_STORAGE_KEYS.REFRESH_TOKEN);
      return token || null;
    } catch (error) {
      console.error('[TokenManager] Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Get token expiration time
   */
  async getExpiresAt(): Promise<number | null> {
    try {
      const expiresAtStr = await AsyncStorage.getItem(SECURE_STORAGE_KEYS.TOKEN_EXPIRES_AT);
      return expiresAtStr ? parseInt(expiresAtStr) : null;
    } catch (error) {
      console.error('[TokenManager] Failed to get expiration time:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  async isTokenExpired(): Promise<boolean> {
    try {
      const expiresAt = await this.getExpiresAt();
      if (!expiresAt) return true;
      return Date.now() >= expiresAt;
    } catch (error) {
      console.error('[TokenManager] Error checking expiration:', error);
      return true;
    }
  }

  /**
   * Get valid token (refresh if needed)
   */
  async getValidToken(): Promise<string | null> {
    try {
      const isExpired = await this.isTokenExpired();

      if (isExpired) {
        const success = await this.refreshToken();
        if (!success) return null;
      }

      return this.getAccessToken();
    } catch (error) {
      console.error('[TokenManager] Failed to get valid token:', error);
      return null;
    }
  }

  /**
   * Decode JWT payload (without verification)
   */
  private decodeToken(token: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf-8')
      );
      return payload;
    } catch (error) {
      console.error('[TokenManager] Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = await this.getRefreshToken();
        if (!refreshToken) {
          console.log('[TokenManager] No refresh token available');
          return false;
        }

        // Import here to avoid circular dependency
        const { missionControlAPI } = await import('../api/apiClient');

        const response = await missionControlAPI.refreshToken(refreshToken);
        const { accessToken, expiresIn, refreshToken: newRefreshToken } = response.data;

        await this.setTokens({
          accessToken,
          refreshToken: newRefreshToken || refreshToken,
          expiresIn,
          expiresAt: Date.now() + expiresIn * 1000,
        });

        console.log('[TokenManager] Token refreshed successfully');
        return true;
      } catch (error) {
        console.error('[TokenManager] Token refresh failed:', error);
        // Clear tokens on refresh failure
        await this.clearTokens();
        useStore.setState({ isAuthenticated: false });
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Schedule token refresh before expiration
   */
  private scheduleTokenRefresh(msUntilExpiry: number) {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Schedule refresh threshold before expiry
    const refreshIn = Math.max(0, msUntilExpiry - REFRESH_THRESHOLD_MS);

    console.log('[TokenManager] Scheduling refresh in', Math.round(refreshIn / 1000), 'seconds');

    this.refreshTimer = setTimeout(() => {
      console.log('[TokenManager] Initiating scheduled token refresh');
      this.refreshToken();
    }, refreshIn);
  }

  /**
   * Clear all tokens
   */
  async clearTokens() {
    try {
      await SecureStore.deleteItemAsync(SECURE_STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(SECURE_STORAGE_KEYS.REFRESH_TOKEN);
      await AsyncStorage.removeItem(SECURE_STORAGE_KEYS.TOKEN_EXPIRES_AT);

      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
      }

      console.log('[TokenManager] Tokens cleared');
    } catch (error) {
      console.error('[TokenManager] Failed to clear tokens:', error);
    }
  }

  /**
   * Get token info for debugging
   */
  async getTokenInfo() {
    try {
      const token = await this.getAccessToken();
      const expiresAt = await this.getExpiresAt();
      const isExpired = await this.isTokenExpired();

      if (token) {
        const payload = this.decodeToken(token);
        return {
          hasToken: true,
          isExpired,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          payload,
        };
      }

      return { hasToken: false };
    } catch (error) {
      console.error('[TokenManager] Failed to get token info:', error);
      return { hasToken: false, error: error.message };
    }
  }
}

// Singleton instance
export const tokenManager = new TokenManager();

export default tokenManager;
