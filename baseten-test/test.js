import { baseten, createBaseten } from '@ai-sdk/baseten';
import { generateText, embed } from 'ai';

async function testBaseten() {
  console.log('🧪 Testing Baseten Provider...\n');

  // Test 1: Basic functionality
  console.log('1️⃣ Testing basic text generation...');
  try {
    const { text } = await generateText({
      model: baseten('deepseek-ai/DeepSeek-V3-0324'),
      prompt: 'What is the meaning of life? Answer in one sentence.',
    });
    
    console.log('✅ Success! Response:', text);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n2️⃣ Testing different model...');
  try {
    const { text } = await generateText({
      model: baseten('meta-llama/Llama-4-Maverick-17B-128E-Instruct'),
      prompt: 'Explain quantum computing in simple terms.',
    });
    
    console.log('✅ Success! Response:', text);
  } catch (error) {
    console.error('❌ Error:', error.message);
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
    console.error('❌ Error testing provider methods:', error.message);
  }


  console.log('\n4️⃣ Testing embeddings...');
  try {
    // Only test if BASETEN_MODEL_URL is set
    if (process.env.BASETEN_MODEL_URL) {
      const embeddingModel = baseten.textEmbeddingModel('embeddings');
      console.log('✅ textEmbeddingModel method works');
    } else {
      console.log('⏭️ Skipping embedding test - no BASETEN_MODEL_URL set');
    }
    
    // Test with custom model URL for embeddings
    const baseten = createBaseten({
      modelURL: 'https://model-yqv4ypxq.api.baseten.co/environments/production/sync/v1',
    });
    
    // Create embedding model with custom URL
    const embeddingModel = baseten.textEmbeddingModel();
    console.log('✅ Custom embedding model created');
    
    // Use the embed function to actually embed text
    const { embedding, usage } = await embed({
      model: embeddingModel,
      value: 'sunny day at the beach',
    });
    console.log('✅ Embedding length:', embedding.length);
    console.log('✅ Custom model URL works for embeddings');
    
  } catch (error) {
    console.log('❌ Error testing embeddings:', error.message);
  }

  console.log('\n5️⃣ Testing unsupported features...');
  try {
    // This should throw an error
    baseten.imageModel('test-model');
  } catch (error) {
    console.log('✅ Correctly throws error for unsupported imageModel:', error.message);
  }

  console.log('\n🎉 Test completed!');
}

// Run the test
testBaseten().catch(console.error); 