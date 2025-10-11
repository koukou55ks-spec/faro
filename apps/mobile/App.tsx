import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // 初回挨拶
  useEffect(() => {
    if (messages.length === 0) {
      const greetingMessage: Message = {
        role: 'assistant',
        content: `こんにちは！\n\n私はFaro、あなたのパーソナルCFOです。\n\nお金のこと、何でも相談してください。`,
        timestamp: new Date()
      };
      setMessages([greetingMessage]);
    }
  }, []);

  // Auto scroll
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // TODO: API統合（packages/infrastructure を使用）
    // 現在はダミーレスポンス
    setTimeout(() => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: 'モバイルアプリ版のFaroです！API統合は次のステップで実装します。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { marginRight: 12 }]}>
            <Text style={styles.logoText}>✨</Text>
          </View>
          <View>
            <Text style={styles.title}>Faro</Text>
            <Text style={styles.subtitle}>Personal CFO</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageRow,
              message.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant
            ]}
          >
            {message.role === 'assistant' && (
              <View style={[styles.avatarAssistant, { marginRight: 12 }]}>
                <Text style={styles.avatarText}>✨</Text>
              </View>
            )}

            <View style={[
              styles.messageBubble,
              message.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant
            ]}>
              <Text style={[
                styles.messageText,
                message.role === 'user' ? styles.messageTextUser : styles.messageTextAssistant
              ]}>
                {message.content}
              </Text>
              <Text style={[
                styles.timestamp,
                message.role === 'user' ? styles.timestampUser : styles.timestampAssistant
              ]}>
                {message.timestamp.toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>

            {message.role === 'user' && (
              <View style={[styles.avatarUser, { marginLeft: 12 }]}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
            )}
          </View>
        ))}

        {isLoading && (
          <View style={styles.messageRowAssistant}>
            <View style={[styles.avatarAssistant, { marginRight: 12 }]}>
              <Text style={styles.avatarText}>✨</Text>
            </View>
            <View style={styles.messageBubbleAssistant}>
              <Text style={styles.messageTextAssistant}>Thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, { marginRight: 12 }]}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Message Faro..."
            placeholderTextColor="#6B7280"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputMessage.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.helperText}>
          Press Enter to send
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    backgroundColor: '#0F0F0F',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  messageRowUser: {
    flexDirection: 'row-reverse',
  },
  messageRowAssistant: {
    flexDirection: 'row',
  },
  avatarAssistant: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarUser: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageBubbleUser: {
    backgroundColor: '#2563EB',
  },
  messageBubbleAssistant: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  messageTextAssistant: {
    color: '#E5E7EB',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 8,
  },
  timestampUser: {
    color: '#BFDBFE',
  },
  timestampAssistant: {
    color: '#6B7280',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    backgroundColor: '#0F0F0F',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
});
