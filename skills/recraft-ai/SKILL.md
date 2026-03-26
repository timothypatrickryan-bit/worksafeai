---
name: recraft-ai
description: Generate professional images using Recraft.AI API. Use when you need to create custom images for LinkedIn posts, marketing materials, or any visual content. Supports text-to-image generation with customizable styles, dimensions, and quality settings. Ideal for: (1) Creating LinkedIn post images, (2) Generating product/service visuals, (3) Creating branded graphics, (4) Producing marketing collateral.
---

# Recraft.AI Image Generation

Generate professional, high-quality images using Recraft.AI's API. Perfect for creating custom visuals for LinkedIn posts and marketing materials.

## Quick Start

### Generate an Image

```bash
node scripts/generate-image.js "Your image prompt here" [--style professional] [--size 1024x1024]
```

**Parameters:**
- `prompt` (required): Detailed description of the image you want
- `--style` (optional): Image style (professional, artistic, realistic, abstract, etc.)
- `--size` (optional): Image dimensions (default: 1024x1024, options: 512x512, 1024x1024, 1536x1536)

**Output:** Saves image to `/tmp/recraft-[timestamp].png` and returns URL

### Example: LinkedIn Post Image

```bash
node scripts/generate-image.js \
  "Modern data center exterior, glass and steel architecture, fiber optic cables glowing in foreground, Northeast USA landscape, professional photography, daylight, no people" \
  --style professional \
  --size 1024x1024
```

Returns image URL ready to download or post.

## Integration with LinkedIn Posts

When used with the LinkedIn post generator:

1. Post generator creates image prompt alongside content
2. You run the image generation script with the prompt
3. Script returns image URL
4. Download and post to LinkedIn alongside text

## Script Reference

See `scripts/generate-image.js` for complete API integration.

**Key functions:**
- `generateImage(prompt, options)` — Main function to generate images
- Handles authentication with your API key
- Manages rate limiting and retries
- Returns image download URL

## API Configuration

Your Recraft.AI API key is stored securely in environment variables.

**To test connection:**
```bash
node scripts/test-recraft.js
```

## Image Quality Tips

- **Be specific**: More detailed prompts = better results
- **Include style**: "professional photography" vs "abstract art" matters
- **Mention context**: "Northeast data center" vs generic "building"
- **Avoid conflicts**: Don't ask for "realistic photo style" AND "artistic illustration"

## Limitations

- Rate limited to API plan quota
- Generation takes ~30-60 seconds per image
- Requires active internet connection
- Large batches should include delays between requests

## Troubleshooting

**Authentication fails**: Check that API key is set correctly
**Timeout errors**: API may be slow; retry after 30 seconds
**Invalid prompt**: Recraft rejects prompts with restricted content; rephrase and retry

---

## Files

- `scripts/generate-image.js` — Main image generation script
- `scripts/test-recraft.js` — Test API connection
