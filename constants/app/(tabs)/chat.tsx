
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { Message } from '@/types';

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'ai',
      senderName: 'AI Assistant',
      message: 'Hello! I&apos;m your medical AI assistant. How can I help you today?',
      timestamp: new Date().toISOString(),
      isAI: true,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'patient1',
      senderName: 'You',
      message: inputText,
      timestamp: new Date().toISOString(),
      isAI: false,
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'ai',
        senderName: 'AI Assistant',
        message: getAIResponse(inputText),
        timestamp: new Date().toISOString(),
        isAI: true,
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
      return 'I can help you book an appointment. Please go to the Appointments tab to view available doctors and schedule a visit.';
    } else if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
      return 'If this is a medical emergency, please call 911 immediately or use the Emergency tab to send an alert to nearby hospitals.';
    } else if (lowerMessage.includes('prescription') || lowerMessage.includes('medication')) {
      return 'You can view your active prescriptions in the Medical Records tab. If you need a refill, please contact your doctor or use the pharmacy feature.';
    } else if (lowerMessage.includes('symptom') || lowerMessage.includes('pain') || lowerMessage.includes('sick')) {
      return 'I understand you&apos;re experiencing symptoms. While I can provide general information, I recommend scheduling an appointment with a doctor for proper diagnosis and treatment. Would you like me to help you book an appointment?';
    } else if (lowerMessage.includes('thank')) {
      return 'You&apos;re welcome! Is there anything else I can help you with?';
    } else {
      return 'I&apos;m here to help with your medical needs. You can ask me about appointments, prescriptions, emergency services, or general health information. How can I assist you?';
    }
  };

  const quickActions = [
    { text: 'Book Appointment', icon: 'calendar' },
    { text: 'View Records', icon: 'doc.text' },
    { text: 'Medication Info', icon: 'pills' },
    { text: 'Emergency Help', icon: 'exclamationmark.triangle' },
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.aiAvatar}>
            <IconSymbol 
              ios_icon_name="brain" 
              android_material_icon_name="psychology" 
              size={24} 
              color={colors.primary}
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerSubtitle}>Always here to help</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageWrapper,
              message.isAI ? styles.aiMessageWrapper : styles.userMessageWrapper,
            ]}
          >
            {message.isAI && (
              <View style={styles.messageAvatar}>
                <IconSymbol 
                  ios_icon_name="brain" 
                  android_material_icon_name="psychology" 
                  size={20} 
                  color={colors.primary}
                />
              </View>
            )}
            <View
              style={[
                styles.messageBubble,
                message.isAI ? styles.aiMessageBubble : styles.userMessageBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isAI ? styles.aiMessageText : styles.userMessageText,
                ]}
              >
                {message.message}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  message.isAI ? styles.aiMessageTime : styles.userMessageTime,
                ]}
              >
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}

        {/* Quick Actions */}
        {messages.length === 1 && (
          <View style={styles.quickActionsContainer}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickActionButton}
                  onPress={() => setInputText(action.text)}
                >
                  <IconSymbol 
                    ios_icon_name={action.icon} 
                    android_material_icon_name={action.icon.replace('.', '_')} 
                    size={20} 
                    color={colors.primary}
                  />
                  <Text style={styles.quickActionText}>{action.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={inputText.trim() === ''}
          >
            <IconSymbol 
              ios_icon_name="arrow.up" 
              android_material_icon_name="send" 
              size={20} 
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.card,
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 100,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  aiMessageWrapper: {
    alignSelf: 'flex-start',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '100%',
  },
  aiMessageBubble: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 4,
  },
  userMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  aiMessageText: {
    color: colors.text,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
  },
  aiMessageTime: {
    color: colors.textSecondary,
  },
  userMessageTime: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  quickActionsContainer: {
    marginTop: 24,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  quickActionText: {
    fontSize: 14,
    color: colors.text,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
});
