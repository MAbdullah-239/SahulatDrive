import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import {Mic, Square, ArrowLeft, Volume2} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AVLinearPCMBitDepthKeyIOSType,
  AudioEncoderAndroidType,
  AudioSet,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {voiceQuery, VoiceQueryTimings} from '../../../requestHandler/ragApi';

type Turn = {
  id: string;
  transcript: string;
  answer: string;
};

const audioRecorderPlayer = new AudioRecorderPlayer();

// react-native-audio-recorder-player defaults to Apple Lossless (ALAC) with a
// bogus PCM bit-depth fallback when no audioSets are given, which reliably
// fails AVAudioRecorder.record() on real iOS hardware ("Error occured during
// initiating recorder"). Explicit AAC settings avoid that default entirely.
const audioSet: AudioSet = {
  AVFormatIDKeyIOS: AVEncodingOption.aac,
  AVNumberOfChannelsKeyIOS: 1,
  AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.medium,
  // Must be set explicitly - if left undefined, the native module's own
  // fallback (`AVLinearPCMBitDepthKey.count`, i.e. Swift's String.count on
  // the key's literal name) produces a nonsense bit-depth value that gets
  // baked into AVAudioRecorder's settings for every format, not just PCM,
  // and reliably fails record() on real devices.
  AVLinearPCMBitDepthKeyIOS: AVLinearPCMBitDepthKeyIOSType.bit16,
  OutputFormatAndroid: OutputFormatAndroidType.MPEG_4,
  AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
  AudioChannelsAndroid: 1,
};

async function ensureMicPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'Microphone Permission',
      message: 'Sahulat Drive needs microphone access for the voice assistant.',
      buttonPositive: 'Allow',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

const VoiceAssistant: React.FC = () => {
  const navigation = useNavigation();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastTimings, setLastTimings] = useState<VoiceQueryTimings | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      audioRecorderPlayer.removeRecordBackListener();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    const hasPermission = await ensureMicPermission();
    if (!hasPermission) {
      setError('Microphone permission is required to use the voice assistant.');
      return;
    }

    try {
      // Using 'DEFAULT' instead of a custom path lets the native module pick
      // its own caches-dir location/extension - this is what nearly every
      // library example uses, and rules out our own path construction as a
      // cause. stopRecorder()'s return value is the actual final file path,
      // so nothing downstream depends on `recordingPath` matching this.
      await audioRecorderPlayer.startRecorder('DEFAULT', audioSet);
      audioRecorderPlayer.addRecordBackListener(() => {});
      setIsRecording(true);
    } catch (err: any) {
      console.warn('[VoiceAssistant] startRecorder failed', err);
      setError('Could not start recording. Please try again.');
    }
  };

  const stopRecordingAndAsk = async () => {
    const finalPath = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setIsRecording(false);
    setIsProcessing(true);
    setError(null);

    try {
      const result = await voiceQuery(finalPath);
      if (!mountedRef.current) {
        return;
      }

      setTurns(prev => [
        ...prev,
        {id: String(Date.now()), transcript: result.transcript, answer: result.answer},
      ]);
      setLastTimings(result.timings);

      setIsSpeaking(true);
      // startPlayer's native code only treats the path as a real absolute
      // path when it's prefixed with file:// (or http(s)://) - otherwise it
      // silently (mis)treats it as relative to the caches dir and mangles
      // it, and still resolves the promise as if playback started fine.
      const playablePath = result.audioPath.startsWith('file://')
        ? result.audioPath
        : `file://${result.audioPath}`;
      await audioRecorderPlayer.startPlayer(playablePath);
      audioRecorderPlayer.addPlayBackListener(meta => {
        if (meta.currentPosition >= meta.duration && meta.duration > 0) {
          audioRecorderPlayer.stopPlayer();
          audioRecorderPlayer.removePlayBackListener();
          if (mountedRef.current) {
            setIsSpeaking(false);
          }
        }
      });
    } catch (err: any) {
      console.warn('[VoiceAssistant] voice-query failed', err);
      if (mountedRef.current) {
        setError(
          'Could not reach the voice assistant service. Make sure it is running and RAG_API_BASE_URL is reachable from this device.',
        );
      }
    } finally {
      if (mountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  const onMicPress = () => {
    if (isRecording) {
      stopRecordingAndAsk();
    } else if (!isProcessing && !isSpeaking) {
      startRecording();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgColor} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <ArrowLeft size={20} color={Colors.White} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice Assistant</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {turns.length === 0 && (
          <Text style={styles.hint}>
            Tap the mic and ask about a vehicle issue — flat tyre, dead battery,
            engine overheating, brakes, emergency help, or workshop booking.
            English, Urdu, or Roman Urdu all work.
          </Text>
        )}

        {turns.map(turn => (
          <View key={turn.id} style={styles.turnCard}>
            <Text style={styles.turnLabel}>You asked</Text>
            <Text style={styles.turnTranscript}>{turn.transcript}</Text>
            <View style={styles.turnDivider} />
            <Text style={styles.turnLabel}>Assistant</Text>
            <Text style={styles.turnAnswer}>{turn.answer}</Text>
          </View>
        ))}

        {error && <Text style={styles.errorText}>{error}</Text>}

        {lastTimings && (
          <Text style={styles.timingText}>
            Last round-trip: {lastTimings.total.toFixed(1)}s (transcribe{' '}
            {lastTimings.transcribe.toFixed(1)}s, retrieve{' '}
            {lastTimings.retrieve.toFixed(1)}s, generate{' '}
            {lastTimings.generate.toFixed(1)}s, speak{' '}
            {lastTimings.synthesize.toFixed(1)}s)
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.micButtonActive]}
          onPress={onMicPress}
          disabled={isProcessing || isSpeaking}
          activeOpacity={0.85}>
          {isProcessing ? (
            <ActivityIndicator color={Colors.White} />
          ) : isRecording ? (
            <Square size={26} color={Colors.White} fill={Colors.White} />
          ) : isSpeaking ? (
            <Volume2 size={28} color={Colors.White} />
          ) : (
            <Mic size={28} color={Colors.White} />
          )}
        </TouchableOpacity>
        <Text style={styles.footerLabel}>
          {isProcessing
            ? 'Thinking...'
            : isRecording
            ? 'Listening... tap to stop'
            : isSpeaking
            ? 'Speaking...'
            : 'Tap to ask'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default VoiceAssistant;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 22,
    color: Colors.White,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  hint: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 14,
    color: Colors.GreyText,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 40,
  },
  turnCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 18,
    marginBottom: 16,
  },
  turnLabel: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 12,
    color: '#E8490F',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  turnTranscript: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 15,
    color: Colors.White,
    lineHeight: 21,
  },
  turnDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 14,
  },
  turnAnswer: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 15,
    color: Colors.GreyText,
    lineHeight: 22,
  },
  errorText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 13,
    color: Colors.Red,
    textAlign: 'center',
    marginTop: 12,
  },
  timingText: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 11,
    color: Colors.GreyText,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },
  micButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E8490F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8490F',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 6},
    elevation: 6,
  },
  micButtonActive: {
    backgroundColor: Colors.Red,
  },
  footerLabel: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 13,
    color: Colors.GreyText,
    marginTop: 12,
  },
});
