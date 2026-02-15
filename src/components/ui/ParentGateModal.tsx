// Ebeveyn Kapisi Modal - Cross-platform (Alert.prompt iOS-only yerine)
// Rastgele toplama sorusu ile ebeveyn dogrulamasi

import { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

interface ParentGateModalProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

function generateQuestion() {
  const a = Math.floor(Math.random() * 15) + 5;
  const b = Math.floor(Math.random() * 15) + 5;
  return { a, b, answer: a + b };
}

export function ParentGateModal({ visible, onSuccess, onCancel }: ParentGateModalProps) {
  const [question, setQuestion] = useState(generateQuestion);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const resetState = useCallback(() => {
    setQuestion(generateQuestion());
    setInput('');
    setError(false);
  }, []);

  const handleSubmit = () => {
    if (parseInt(input, 10) === question.answer) {
      resetState();
      onSuccess();
    } else {
      setError(true);
      setInput('');
      setQuestion(generateQuestion());
    }
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleCancel}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Ebeveyn Dogrulama</Text>
          <Text style={styles.question}>
            {question.a} + {question.b} = ?
          </Text>

          {error && (
            <Text style={styles.errorText}>Yanlis cevap, tekrar deneyin.</Text>
          )}

          <TextInput
            style={styles.input}
            value={input}
            onChangeText={(text) => {
              setInput(text);
              setError(false);
            }}
            keyboardType="number-pad"
            autoFocus
            maxLength={3}
            placeholder="?"
            placeholderTextColor={COLORS.locked}
          />

          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Iptal</Text>
            </Pressable>
            <Pressable
              style={[styles.submitButton, !input && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!input}
            >
              <Text style={styles.submitButtonText}>Giris</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.paddingXl,
  },
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingXl,
    alignItems: 'center',
    gap: SIZES.paddingMd,
    width: '100%',
    maxWidth: 320,
  },
  title: {
    fontSize: FONTS.sizeMd,
    fontWeight: FONTS.weightBold,
    color: COLORS.text,
  },
  question: {
    fontSize: FONTS.sizeLg,
    fontWeight: FONTS.weightBlack,
    color: COLORS.primary,
  },
  errorText: {
    fontSize: FONTS.sizeSm,
    color: COLORS.warning,
    textAlign: 'center',
  },
  input: {
    width: 100,
    height: SIZES.touchableMin,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusSm,
    fontSize: FONTS.sizeLg,
    fontWeight: FONTS.weightBold,
    color: COLORS.text,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SIZES.paddingMd,
    marginTop: SIZES.paddingSm,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SIZES.touchableMin,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.backgroundDark,
  },
  cancelButtonText: {
    fontSize: FONTS.sizeMd,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textLight,
  },
  submitButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SIZES.touchableMin,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.primary,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: FONTS.sizeMd,
    fontWeight: FONTS.weightBold,
    color: COLORS.textWhite,
  },
});
