# AI Model Logos

This directory contains logos for various AI providers used in the workflow automation application.

## Required Logos

To ensure all AI model nodes display properly, add the following logo files:

- `anthropic.png` - Anthropic logo
- `claude35.png` - Claude 3.5 logo (can be same as Anthropic with different styling)
- `openai.png` - OpenAI logo
- `gemini.png` - Google Gemini logo
- `cohere.png` - Cohere logo
- `perplexity.png` - Perplexity logo
- `xai.png` - X.AI/Grok logo
- `aws-bedrock.png` - AWS Bedrock logo
- `azure-openai.png` - Azure OpenAI logo

## Provider-Specific Logos

For AWS Bedrock model providers:
- `anthropic.png` - Anthropic models on AWS 
- `amazon.png` - Amazon Titan models
- `meta.png` - Meta/Llama models on AWS
- `cohere.png` - Cohere models on AWS
- `mistral.png` - Mistral models on AWS

For Azure OpenAI model groups:
- `azure-gpt-4.png` - GPT-4 models
- `azure-gpt-3.5.png` - GPT-3.5 models
- `azure-embeddings.png` - Embedding models
- `azure-image-generation.png` - DALL-E models

## Fallback Behavior

If a logo file is missing, the application will attempt to load a fallback from the respective company's website. If that also fails, a colored indicator will be shown instead.

## Adding New Logos

1. Use transparent PNG files when possible
2. Recommended size: 128x128 pixels or larger
3. Keep the filename lowercase and use hyphens for spaces
4. Square aspect ratio works best with the UI design 