import React from 'react';
import { Modal, Pressable, Text, TouchableWithoutFeedback, View } from 'react-native';

import { useAppTheme } from '../../../theme/ThemeContext';

interface QuickUnitHoldModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Minimal placeholder for the future "Quick Unit Hold" flow. Real holds
 * require lead attachment and the 3-active-hold quota check, both of which
 * depend on the backend — so this mock build only shows a notice.
 */
export const QuickUnitHoldModal: React.FC<QuickUnitHoldModalProps> = ({ visible, onClose }) => {
  const { colors } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}>
          <TouchableWithoutFeedback>
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: colors.border,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                backgroundColor: colors.card,
                padding: 20,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Quick Unit Hold</Text>
              <Text style={{ marginTop: 10, fontSize: 13, lineHeight: 19, color: colors.textSecondary }}>
                Coming soon / mock. Placing a real hold requires an attached client lead and the 3-active-hold quota
                check, both of which depend on the backend. No hold has been created.
              </Text>
              <Pressable
                onPress={onClose}
                style={{ marginTop: 18, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>Close</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
