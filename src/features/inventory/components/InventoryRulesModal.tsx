import React from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';
import { X } from 'lucide-react-native';

import { useAppTheme } from '../../../theme/ThemeContext';

interface InventoryRulesModalProps {
  visible: boolean;
  onClose: () => void;
}

const RULES: Array<{ title: string; body: string }> = [
  {
    title: 'Maximum 3 Active Holds Quota',
    body: 'Each sales agent can have a maximum of 3 active unit or plot holds at any one time to prevent inventory hoarding.',
  },
  {
    title: 'Mandatory Lead Attachment',
    body: 'Every hold request must be attached to an active client lead (selected from your queue or entered as a new referral/office lead). Anonymous holds are strictly rejected.',
  },
  {
    title: 'Head Office Two-Tier Approval',
    body: 'Placing a hold creates a 2-hour soft hold marked PENDING_APPROVAL. Head Office validates client interest. Once approved, the official 72-hour countdown begins.',
  },
  {
    title: 'Auto-Release & Token Deposit',
    body: 'If an advance booking token (bKash/cheque) is not submitted within 72 hours, the unit automatically returns to public availability.',
  },
];

/**
 * Plain-English explainer for the inventory hold/booking quota rules,
 * opened from the "Booking Rules" banner on the Inventory screen.
 */
export const InventoryRulesModal: React.FC<InventoryRulesModalProps> = ({ visible, onClose }) => {
  const { colors } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}>
          <TouchableWithoutFeedback>
            <View
              style={{
                maxHeight: '88%',
                borderTopWidth: 1,
                borderTopColor: colors.border,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                backgroundColor: colors.card,
              }}
            >
              <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, flex: 1, marginRight: 8 }}>
                    Agent Inventory Booking &amp; Hold Rules
                  </Text>
                  <Pressable onPress={onClose} style={{ height: 36, width: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: colors.subpanel }}>
                    <X size={16} color={colors.textPrimary} />
                  </Pressable>
                </View>

                {RULES.map((rule) => (
                  <View
                    key={rule.title}
                    style={{ marginTop: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, padding: 12 }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>{rule.title}</Text>
                    <Text style={{ marginTop: 6, fontSize: 12, lineHeight: 18, color: colors.textSecondary }}>{rule.body}</Text>
                  </View>
                ))}

                <Pressable
                  onPress={onClose}
                  style={{ marginTop: 20, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>Close Guidelines</Text>
                </Pressable>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
