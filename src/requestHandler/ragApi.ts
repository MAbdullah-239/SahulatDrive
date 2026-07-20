import RNFS from 'react-native-fs';
import {decode as base64Decode, encode as base64Encode} from 'base-64';
import utf8 from 'utf8';
import ragApiClient from './ragApiClient';

export interface VoiceQueryTimings {
  transcribe: number;
  retrieve: number;
  generate: number;
  synthesize: number;
  total: number;
}

export interface VoiceQueryResult {
  audioPath: string; // local file, playable via AudioRecorderPlayer.startPlayer
  transcript: string;
  answer: string;
  timings: VoiceQueryTimings;
}

// Uint8Array -> base64, chunked to avoid call-stack blowups on large buffers
// when spreading into String.fromCharCode.
function bytesToBase64(bytes: Uint8Array): string {
  const CHUNK_SIZE = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE));
  }
  return base64Encode(binary);
}

// The server puts transcript/answer in base64-encoded headers (X-Transcript-B64,
// X-Answer-B64) since raw Urdu-script text can't safely go in HTTP headers.
// base-64's decode() gives back a binary (Latin-1) string; utf8.decode()
// turns that into the real Unicode string.
function decodeUtf8Header(value: string | undefined): string {
  if (!value) {
    return '';
  }
  return utf8.decode(base64Decode(value));
}

export async function voiceQuery(recordingPath: string): Promise<VoiceQueryResult> {
  const fileUri = recordingPath.startsWith('file://')
    ? recordingPath
    : `file://${recordingPath}`;

  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: 'audio/m4a',
    name: 'voice-query.m4a',
  } as any);

  const response = await ragApiClient.post('/voice-query', formData, {
    headers: {'Content-Type': 'multipart/form-data'},
    responseType: 'arraybuffer',
  });

  const audioBase64 = bytesToBase64(new Uint8Array(response.data));
  const audioPath = `${RNFS.CachesDirectoryPath}/voice-response-${Date.now()}.wav`;
  await RNFS.writeFile(audioPath, audioBase64, 'base64');

  return {
    audioPath,
    transcript: decodeUtf8Header(response.headers['x-transcript-b64']),
    answer: decodeUtf8Header(response.headers['x-answer-b64']),
    timings: {
      transcribe: parseFloat(response.headers['x-timing-transcribe'] ?? '0'),
      retrieve: parseFloat(response.headers['x-timing-retrieve'] ?? '0'),
      generate: parseFloat(response.headers['x-timing-generate'] ?? '0'),
      synthesize: parseFloat(response.headers['x-timing-synthesize'] ?? '0'),
      total: parseFloat(response.headers['x-timing-total'] ?? '0'),
    },
  };
}
