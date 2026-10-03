import React, { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '../../../theme/ThemeContext';

type DepositMethod = 'MFS' | 'CHEQUE';

interface TokenDepositDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    method: DepositMethod;
    unitCode: string;
    reference: string;
    amount: string;
    notes: string;
  }) => void;
}

export function TokenDepositDrawer({ visible, onClose, onSubmit }: TokenDepositDrawerProps) {
  const { tokens } = useAppTheme();
  const [method, setMethod] = useState<DepositMethod>('MFS');
  const [unitCode, setUnitCode] = useState('A-09');
  const [reference, setReference] = useState('mfs_trx_4821');
  const [amount, setAmount] = useState('250000');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSubmit({ method, unitCode: unitCode.trim(), reference: reference.trim(), amount, notes: notes.trim() });
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: tokens.overlay, justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: tokens.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTopWidth: 1,
            borderColor: tokens.border,
            padding: 20,
            paddingBottom: 32,
          }}
        >
          <Text style={{ color: tokens.textPrimary, fontSize: 24, fontWeight: '800' }}>Token deposit</Text>
          <Text style={{ color: tokens.textSecondary, fontSize: 13, marginTop: 6 }}>
            Log the advance payment for accounts clearance.
          </Text>

          <View style={{ marginTop: 18, flexDirection: 'row', gap: 8 }}>
            {[
              { value: 'MFS', label: 'bKash / Nagad' },
              { value: 'CHEQUE', label: 'Bank Cheque' },
            ].map((option) => {
              const active = method === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setMethod(option.value as DepositMethod)}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: active ? tokens.accent : tokens.border,
                    backgroundColor: active ? tokens.subpanel : 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: active ? tokens.textPrimary : tokens.textSecondary, fontSize: 12, fontWeight: '700' }}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={{ color: tokens.textSecondary, fontSize: 12, fontWeight: '700', marginTop: 18 }}>Target Unit Code</Text>
          <TextInput
            value={unitCode}
            onChangeText={setUnitCode}
            style={{
              marginTop: 8,
              minHeight: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: tokens.border,
              backgroundColor: tokens.subpanel,
              color: tokens.textPrimary,
              paddingHorizontal: 12,
            }}
          />

          <Text style={{ color: tokens.textSecondary, fontSize: 12, fontWeight: '700', marginTop: 18 }}>
            {method === 'MFS' ? 'Transaction Reference' : 'Cheque Number'}
          </Text>
          <TextInput
            value={reference}
            onChangeText={setReference}
            style={{
              marginTop: 8,
              minHeight: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: tokens.border,
              backgroundColor: tokens.subpanel,
              color: tokens.textPrimary,
              paddingHorizontal: 12,
            }}
          />

          <Text style={{ color: tokens.textSecondary, fontSize: 12, fontWeight: '700', marginTop: 18 }}>Amount in BDT</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={{
              marginTop: 8,
              minHeight: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: tokens.border,
              backgroundColor: tokens.subpanel,
              color: tokens.textPrimary,
              paddingHorizontal: 12,
            }}
          />

          <Text style={{ color: tokens.textSecondary, fontSize: 12, fontWeight: '700', marginTop: 18 }}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            placeholder="Any account notes or client remarks"
            placeholderTextColor={tokens.textSecondary}
            style={{
              minHeight: 90,
              marginTop: 8,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: tokens.border,
              backgroundColor: tokens.subpanel,
              color: tokens.textPrimary,
              paddingHorizontal: 12,
              paddingVertical: 10,
              textAlignVertical: 'top',
            }}
          />

          <View style={{ flexDirection: 'row', marginTop: 20, gap: 10 }}>
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: tokens.border,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: tokens.textSecondary, fontSize: 14, fontWeight: '700' }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: 12,
                backgroundColor: tokens.accent,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#F7F3EE', fontSize: 14, fontWeight: '800' }}>Submit for Accounts Clearance</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
