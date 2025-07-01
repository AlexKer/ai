# Baseten Provider Test

This is a test project for the `@ai-sdk/baseten` provider.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up your API keys:**
Create a `.env` file in this directory:
```bash
echo "BASETEN_API_KEY=your_baseten_api_key_here" > .env
echo "BASETEN_MODEL_URL=https://model-xxxxxxx.api.baseten.co/environments/production/sync/v1" >> .env
```

Get your Baseten API key from: https://baseten.co/

3. **Run the test:**
```bash
npm start
```

## What the test does

The test file (`test.js`) will:

1. ✅ Test basic text generation with DeepSeek V3
2. ✅ Test text generation with Llama 4 Maverick  
3. ✅ Test provider methods (chatModel, languageModel)
4. ✅ Test embeddings with custom model URL
5. ✅ Test error handling for unsupported features

## Available Models

You can test with these Baseten models:
- `deepseek-ai/DeepSeek-V3-0324`
- `deepseek-ai/DeepSeek-R1-0528`
- `meta-llama/Llama-4-Maverick-17B-128E-Instruct`
- `meta-llama/Llama-4-Scout-17B-16E-Instruct`

## Troubleshooting

- **"Cannot find module"**: Make sure you're running from the AI SDK workspace root
- **"API key not found"**: Check your `.env` file and API key
- **"Model not found"**: Verify the model ID is correct 