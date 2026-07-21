import axios from 'axios';
import {RAG_API_BASE_URL} from '@env';

// Separate axios instance for the local Python RAG voice-assistant service
// (sahulat-rag, FastAPI). This is NOT the Rails backend — no session cookie,
// no withCredentials — it's an independent local service the app talks to
// directly. See .env.example for how RAG_API_BASE_URL differs by platform
// (iOS Simulator vs Android Emulator vs physical device).
const ragApiClient = axios.create({
  baseURL: RAG_API_BASE_URL || 'http://localhost:8000',
  // The full voice-query pipeline (transcribe + retrieve + LLM generate +
  // synthesize) runs on unaccelerated CPU and measured ~50s even warm; if
  // Ollama had to reload qwen2.5:7b from an idle unload, add another
  // 10-20s+ on top. 60s wasn't enough headroom in practice.
  timeout: 120000,
});

export default ragApiClient;
