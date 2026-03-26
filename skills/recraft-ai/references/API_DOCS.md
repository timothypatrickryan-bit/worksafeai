# Recraft.AI API Documentation

## API Configuration

**API Key:** Configured via environment variable or script default

**Note:** The correct API endpoint and authentication method needs to be verified with Recraft.AI documentation or account details.

## Current Status

The integration scripts are ready. To complete setup:

1. **Verify API endpoint** — Check Recraft.AI dashboard for correct base URL
2. **Verify authentication** — Confirm Bearer token or API key format
3. **Update scripts** — If endpoint/auth differs, modify paths in generate-image.js and test-recraft.js

## Testing

Once API details are confirmed:

```bash
node scripts/test-recraft.js
```

This will verify your connection and authentication with the actual API.
