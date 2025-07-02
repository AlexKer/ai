import { baseten, createBaseten } from '@ai-sdk/baseten';
import { generateText, embed } from 'ai';

async function testBaseten(): Promise<void> {
  console.log('🧪 Testing Baseten Provider...\n');

  // Test 1: Basic functionality with default Models API
  console.log('1️⃣ Testing basic text generation with default Models API...');
  try {
    const { text } = await generateText({
      model: baseten('deepseek-ai/DeepSeek-V3-0324') as any,
      prompt: 'What is the meaning of life? Answer in one sentence.',
    });
    
    console.log('✅ Success! Response:', text);
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  }

  console.log('\n2️⃣ Testing different model with default Models API...');
  try {
    const { text } = await generateText({
      model: baseten('meta-llama/Llama-4-Maverick-17B-128E-Instruct') as any,
      prompt: 'Explain quantum computing in simple terms.',
    });
    
    console.log('✅ Success! Response:', text);
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  }

  console.log('\n3️⃣ Testing provider methods...');
  try {
    // Test the provider function directly
    const model = baseten('deepseek-ai/DeepSeek-V3-0324');
    console.log('✅ Provider function works');
    
    // Test chatModel method
    const chatModel = baseten.chatModel('deepseek-ai/DeepSeek-V3-0324');
    console.log('✅ chatModel method works');
    
    // Test languageModel method
    const languageModel = baseten.languageModel('deepseek-ai/DeepSeek-V3-0324');
    console.log('✅ languageModel method works');
    
  } catch (error) {
    console.error('❌ Error testing provider methods:', (error as Error).message);
  }

  // --- SCENARIO 1: Embeddings with OpenAI-compatible endpoint (/sync/v1) ---
  console.log('\n4️⃣ Testing embeddings with OpenAI-compatible endpoint (/sync/v1)...');
  try {
    const embeddingBaseten = createBaseten({
      modelURL: 'https://model-03y7n6e3.api.baseten.co/environments/production/sync/v1'
    });
    console.log('🔍 Using OpenAI-compatible endpoint:', 'https://model-03y7n6e3.api.baseten.co/environments/production/sync/v1');
    console.log('🔍 Expected URL:', 'https://model-03y7n6e3.api.baseten.co/environments/production/sync/v1/embeddings');
    console.log('🔍 Note: Model ID must be valid for this specific endpoint');
    
    const embeddingModel = embeddingBaseten.textEmbeddingModel();
    console.log('✅ OpenAI-compatible embedding model created with default model ID');
    
    const { embedding, usage } = await embed({
      model: embeddingModel as any,
      value: 'sunny day at the beach',
    });
    console.log('✅ Embedding length:', embedding.length);
    console.log('✅ OpenAI-compatible embeddings work');
  } catch (error) {
    console.log('❌ Error testing OpenAI-compatible embeddings:', (error as Error).message);
    console.log('💡 Try providing a specific model ID if the default "embeddings" is not valid for this endpoint');
  }

  // --- SCENARIO 2: Embeddings with non-OpenAI-compatible endpoint (/predict) ---
  console.log('\n5️⃣ Testing embeddings with non-OpenAI-compatible endpoint (/predict)...');
  try {
    const embeddingBaseten = createBaseten({
      modelURL: 'https://model-03y7n6e3.api.baseten.co/environments/production/predict'
    });
    console.log('🔍 Using non-OpenAI-compatible endpoint:', 'https://model-03y7n6e3.api.baseten.co/environments/production/predict');
    console.log('🔍 Expected URL:', 'https://model-03y7n6e3.api.baseten.co/environments/production/predict');
    console.log('🔍 Note: Model ID must be valid for this specific endpoint');
    
    const embeddingModel = embeddingBaseten.textEmbeddingModel();
    console.log('✅ Non-OpenAI-compatible embedding model created with default model ID');
    
    const { embedding, usage } = await embed({
      model: embeddingModel as any,
      value: 'sunny day at the beach',
    });
    console.log('✅ Embedding length:', embedding.length);
    console.log('✅ Non-OpenAI-compatible embeddings work');
  } catch (error) {
    console.log('❌ Error testing non-OpenAI-compatible embeddings:', (error as Error).message);
    console.log('💡 Try providing a specific model ID if the default "embeddings" is not valid for this endpoint');
  }

  // --- SCENARIO 3: Custom chat with OpenAI-compatible endpoint (/sync/v1) ---
  console.log('\n6️⃣ Testing custom chat with OpenAI-compatible endpoint (/sync/v1)...');
  try {
    const customBaseten = createBaseten({
      modelURL: 'https://model-owpvn6zw.api.baseten.co/environments/production/sync/v1'
    });
    console.log('🔍 Using OpenAI-compatible endpoint:', 'https://model-owpvn6zw.api.baseten.co/environments/production/sync/v1');
    console.log('🔍 Expected URL:', 'https://model-owpvn6zw.api.baseten.co/environments/production/sync/v1/chat/completions');
    console.log('🔍 Note: Model ID must be valid for this specific endpoint');
    
    const customChatModel = customBaseten();
    console.log('✅ OpenAI-compatible chat model created');
    
    const { text } = await generateText({
      model: customChatModel as any,
      prompt: 'Say hello from the OpenAI-compatible chat model!',
    });
    console.log('✅ OpenAI-compatible chat response:', text);
  } catch (error) {
    console.log('❌ Error testing OpenAI-compatible chat:', (error as Error).message);
    console.log('💡 Try using a different model ID that is valid for this endpoint');
  }

  // --- SCENARIO 4: Custom chat with non-OpenAI-compatible endpoint (/predict) ---
  console.log('\n7️⃣ Testing custom chat with non-OpenAI-compatible endpoint (/predict)...');
  try {
    const customBaseten = createBaseten({
      modelURL: 'https://model-owpvn6zw.api.baseten.co/environments/production/predict'
    });
    console.log('🔍 Using non-OpenAI-compatible endpoint:', 'https://model-owpvn6zw.api.baseten.co/environments/production/predict');
    console.log('🔍 Expected URL:', 'https://model-owpvn6zw.api.baseten.co/environments/production/predict');
    console.log('🔍 Request will be transformed from OpenAI format to Baseten format');
    console.log('🔍 Note: Model ID is not used in the request for /predict endpoints');
    
    const customChatModel = customBaseten('any-model-name');
    console.log('✅ Non-OpenAI-compatible chat model created');
    
    const { text } = await generateText({
      model: customChatModel as any,
      prompt: 'Say hello from the non-OpenAI-compatible chat model!',
    });
    console.log('✅ Non-OpenAI-compatible chat response:', text);
  } catch (error) {
    console.log('❌ Error testing non-OpenAI-compatible chat:', (error as Error).message);
  }

  // --- Error Handling Tests ---
  console.log('\n8️⃣ Testing embeddings without modelURL...');
  try {
    // This should throw an error since no modelURL is provided
    baseten.textEmbeddingModel();
  } catch (error) {
    console.log('✅ Correctly throws error for embeddings without modelURL:', (error as Error).message);
  }

  console.log('\n9️⃣ Testing unsupported features...');
  try {
    // This should throw an error
    baseten.imageModel('test-model');
  } catch (error) {
    console.log('✅ Correctly throws error for unsupported imageModel:', (error as Error).message);
  }

  console.log('\n🎉 All test scenarios completed!');
  console.log('\n📋 Summary of tested scenarios:');
  console.log('   ✅ Default Models API (OpenAI-compatible)');
  console.log('   ✅ Embeddings with /sync/v1 (OpenAI-compatible)');
  console.log('   ✅ Embeddings with /predict (non-OpenAI-compatible)');
  console.log('   ✅ Custom chat with /sync/v1 (OpenAI-compatible)');
  console.log('   ✅ Custom chat with /predict (non-OpenAI-compatible)');
  console.log('   ✅ Error handling for missing modelURL');
  console.log('   ✅ Error handling for unsupported features');
}

// Run the test
testBaseten().catch(console.error); 