import React, { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CheckCircle2, Send, Smartphone, X } from 'lucide-react-native';

import { useAppTheme } from '../../../theme/ThemeContext';
import type { MessageHistoryItem } from '../callingTypes';

interface MessageComposerLead {
  id: string;
  name: string;
  maskedPhoneNumber: string;
  rawPhoneNumber?: string;
  messageHistory?: MessageHistoryItem[];
}

interface MessageComposerModalProps {
  visible: boolean;
  lead: MessageComposerLead | null;
  onClose: () => void;
  onSendMessage?: (entry: MessageHistoryItem) => void;
}

const TEMPLATE_MESSAGES = [
  {
    id: 'intro',
    label: 'Template 1 • Intro & Brochure',
    value:
      'Assalamu Alaikum [Client Name], Space Maker regarding Azad Residency. We would be pleased to share the brochure and discuss availability, pricing, and the best unit options for your needs.',
  },
  {
    id: 'callback',
    label: 'Template 2 • Callback Reminder',
    value:
      'Follow-up regarding our scheduled phone consultation. We would like to continue the discussion and answer any questions before finalizing the next step.',
  },
  {
    id: 'hotline',
    label: 'Template 3 • Hotline Fallback',
    value:
      'For direct assistance, reach our hotline at +880 17XX-XXXXXX. Our team is ready to support you with the latest project details and next steps.',
  },
] as const;

function toRawDigits(value?: string): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

export const MessageComposerModal: React.FC<MessageComposerModalProps> = ({
  visible,
  lead,
  onClose,
  onSendMessage,
}) => {
  const { colors } = useAppTheme();
  const [draftMessage, setDraftMessage] = useState('');

  useEffect(() => {
    if (!lead) return;
    const fallback = `Assalamu Alaikum ${lead.name}, Space Maker regarding your project inquiry. We would be pleased to share the brochure and discuss the next best steps.`;
    setDraftMessage(fallback);
  }, [lead]);

  const cleanPhone = useMemo(() => toRawDigits(lead?.rawPhoneNumber), [lead?.rawPhoneNumber]);
  const maskedPhone = lead?.maskedPhoneNumber ?? '+880 1819-***-34';

  const handleTemplateSelect = (template: string) => {
    const content = template.replace('[Client Name]', lead?.name ?? 'Client');
    setDraftMessage(content);
  };

  const sendMessage = async (channel: 'sms' | 'whatsapp') => {
    if (!lead || !draftMessage.trim()) return;

    const message = draftMessage.trim();
    const sentAt = Date.now();
    const payload = {
      id: `${lead.id}-${channel}-${sentAt}`,
      channel,
      message,
      sentAt,
    } satisfies MessageHistoryItem;

    if (channel === 'whatsapp') {
      const phoneDigits = cleanPhone || toRawDigits(lead?.maskedPhoneNumber);
      const whatsappUrl = `whatsapp://send?phone=${phoneDigits}&text=${encodeURIComponent(message)}`;
      await Linking.openURL(whatsappUrl);
    } else {
      const smsTarget = cleanPhone || lead?.maskedPhoneNumber || '';
      const smsUrl = `sms:${smsTarget}?body=${encodeURIComponent(message)}`;
      await Linking.openURL(smsUrl);
    }

    onSendMessage?.(payload);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
        <View
          style={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 20,
            maxHeight: '90%',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>Message Composer</Text>
              <Text style={{ marginTop: 4, color: colors.textSecondary, fontSize: 13 }}>{lead?.name ?? 'Lead'}</Text>
            </View>
            <Pressable onPress={onClose} style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colors.subpanel }}>
              <X size={18} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View style={{ marginTop: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 14, paddingVertical: 12 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: colors.textSecondary }}>CONTACT</Text>
            <Text selectable={false} style={{ marginTop: 8, fontSize: 15, color: colors.textPrimary, fontFamily: 'monospace' }}>
              {maskedPhone}
            </Text>
          </View>

          <Text style={{ marginTop: 18, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: colors.textSecondary }}>QUICK TEMPLATES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12, gap: 8 }}>
            {TEMPLATE_MESSAGES.map((template) => (
              <Pressable
                key={template.id}
                onPress={() => handleTemplateSelect(template.value)}
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.subpanel,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textPrimary }}>{template.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <TextInput
            value={draftMessage}
            onChangeText={setDraftMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholder="Draft a message to the client..."
            placeholderTextColor={colors.textSecondary}
            style={{
              marginTop: 10,
              minHeight: 140,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.subpanel,
              padding: 14,
              fontSize: 14,
              color: colors.textPrimary,
            }}
          />

          <View style={{ marginTop: 18, flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={() => sendMessage('whatsapp')}
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: 12,
                backgroundColor: '#10B981',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={16} color="#FFFFFF" />
              <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>Send via WhatsApp</Text>
            </Pressable>
            <Pressable
              onPress={() => sendMessage('sms')}
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: 12,
                backgroundColor: '#38BDF8',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Smartphone size={16} color="#FFFFFF" />
              <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>Send via SMS</Text>
            </Pressable>
          </View>

          {lead?.messageHistory && lead.messageHistory.length > 0 && (
            <View style={{ marginTop: 18 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: colors.textSecondary }}>RECENT HISTORY</Text>
              <View style={{ marginTop: 10, gap: 8 }}>
                {lead.messageHistory.slice(-3).reverse().map((entry) => (
                  <View
                    key={entry.id}
                    style={{
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.subpanel,
                      padding: 10,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textPrimary, textTransform: 'uppercase' }}>
                        {entry.channel}
                      </Text>
                      <CheckCircle2 size={14} color={colors.success} />
                    </View>
                    <Text style={{ marginTop: 8, fontSize: 12, lineHeight: 18, color: colors.textSecondary }}>{entry.message}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
