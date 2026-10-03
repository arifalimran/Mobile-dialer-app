import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useAppTheme } from '../../../theme/ThemeContext';

const recentLedgers = [
  { id: 'CMP-8842', label: 'Riverside Heights • A-12', amount: '+৳18,450', status: 'Cleared' },
  { id: 'CMP-8821', label: 'Skyline North • C-14', amount: '+৳11,200', status: 'Under review' },
  { id: 'CMP-8798', label: 'Garden Lane • B-06', amount: '+৳9,780', status: 'Scheduled' },
  { id: 'CMP-8755', label: 'Harbor Crest • D-22', amount: '+৳7,360', status: 'Cleared' },
];

export function WalletScreen() {
  const { tokens } = useAppTheme();

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} style={{ flex: 1, backgroundColor: tokens.canvas }}>
      <Text style={{ color: tokens.textPrimary, fontSize: 28, fontWeight: '800' }}>Wallet & reputation</Text>
      <Text style={{ color: tokens.textSecondary, fontSize: 13, marginTop: 6 }}>
        Transparent payout status and performance earnings.
      </Text>

      <View
        style={{
          marginTop: 18,
          backgroundColor: tokens.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: tokens.border,
          padding: 16,
        }}
      >
        <Text style={{ color: tokens.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>Current Tier</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <View style={{ backgroundColor: 'rgba(200,155,74,0.18)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
            <Text style={{ color: tokens.accent, fontSize: 16, fontWeight: '800' }}>Gold Caller</Text>
          </View>
          <Text style={{ color: tokens.textPrimary, fontSize: 16, fontWeight: '800' }}>1.25% commission</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
        <View style={{ flex: 1, backgroundColor: tokens.card, borderRadius: 16, borderWidth: 1, borderColor: tokens.border, padding: 14 }}>
          <Text style={{ color: tokens.textSecondary, fontSize: 11 }}>Cleared Payout</Text>
          <Text style={{ color: tokens.textPrimary, fontSize: 26, fontWeight: '800', marginTop: 8 }}>৳180,000</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: tokens.card, borderRadius: 16, borderWidth: 1, borderColor: tokens.border, padding: 14 }}>
          <Text style={{ color: tokens.textSecondary, fontSize: 11 }}>Under Verification</Text>
          <Text style={{ color: tokens.warning, fontSize: 26, fontWeight: '800', marginTop: 8 }}>৳75,000</Text>
        </View>
      </View>

      <View
        style={{
          marginTop: 18,
          backgroundColor: tokens.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: tokens.border,
          padding: 16,
        }}
      >
        <Text style={{ color: tokens.textPrimary, fontSize: 18, fontWeight: '800' }}>Recent commission ledgers</Text>

        {recentLedgers.map((ledger) => (
          <View
            key={ledger.id}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: tokens.border,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: tokens.textPrimary, fontSize: 13, fontWeight: '700' }}>{ledger.label}</Text>
              <Text style={{ color: tokens.textSecondary, fontSize: 11, marginTop: 4 }}>{ledger.id}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: tokens.textPrimary, fontSize: 13, fontWeight: '800' }}>{ledger.amount}</Text>
              <Text style={{ color: tokens.accent, fontSize: 11, marginTop: 4 }}>{ledger.status}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
