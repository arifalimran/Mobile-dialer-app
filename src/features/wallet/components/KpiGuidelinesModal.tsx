import React from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';
import { BookOpen, CheckCircle2, Circle, Wallet, X } from 'lucide-react-native';

import { useAppTheme } from '../../../theme/ThemeContext';
import {
  COMMISSION_RATE,
  DAILY_ALLOWANCE_RATE,
  FIXED_BASE_SALARY,
  KPI_TASKS,
  MOBILE_BILL,
  PASS_MARK_POINTS,
  SITE_VISIT_ALLOWANCE,
} from '../utils/calculator';

interface KpiGuidelinesModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateWallet?: () => void;
}

const formatTaka = (value: number) => `৳${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(value)}`;

/**
 * Plain-English explainer for the monthly KPI scoring and payout rules.
 * Opened directly from the Profile Drawer so field callers with limited
 * reading levels can understand exactly how their salary is unlocked,
 * without leaving the current screen. All figures are pulled straight
 * from `calculator.ts` so this copy can never drift from the real math.
 */
export const KpiGuidelinesModal: React.FC<KpiGuidelinesModalProps> = ({ visible, onClose, onNavigateWallet }) => {
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
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <BookOpen size={18} color={colors.accent} />
                    <Text style={{ marginLeft: 8, fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>
                      Monthly KPI &amp; Compensation Policy
                    </Text>
                  </View>
                  <Pressable onPress={onClose} style={{ height: 36, width: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: colors.subpanel }}>
                    <X size={16} color={colors.textPrimary} />
                  </Pressable>
                </View>

                <View style={{ marginTop: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, padding: 14 }}>
                  <Text style={{ fontSize: 13, lineHeight: 20, color: colors.textPrimary }}>
                    Every month you earn points by finishing simple work tasks. Reach{' '}
                    <Text style={{ fontWeight: '800', color: colors.accent }}>{PASS_MARK_POINTS} out of 100 points</Text> to
                    unlock your fixed base salary of <Text style={{ fontWeight: '800' }}>{formatTaka(FIXED_BASE_SALARY)}</Text>.
                    Other allowances and your sales commission are paid separately, every month, no matter your point score.
                  </Text>
                </View>

                <Text style={{ marginTop: 20, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: colors.textSecondary }}>
                  HOW TO EARN YOUR POINTS
                </Text>

                {KPI_TASKS.map((task) => (
                  <View
                    key={task.id}
                    style={{ marginTop: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, padding: 12 }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                        {task.isCompleted ? (
                          <CheckCircle2 size={16} color={colors.success} />
                        ) : (
                          <Circle size={16} color={colors.warning} />
                        )}
                        <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '700', color: colors.textPrimary, flexShrink: 1 }}>
                          {task.simpleName}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: colors.brassAccent }}>+{task.pointsWorth} pts</Text>
                    </View>
                    <Text style={{ marginTop: 8, fontSize: 12, lineHeight: 18, color: colors.textSecondary }}>{task.plainRule}</Text>
                  </View>
                ))}

                <Text style={{ marginTop: 20, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: colors.textSecondary }}>
                  HOW YOUR MONEY IS PAID
                </Text>

                <View style={{ marginTop: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, padding: 12 }}>
                  <Text style={{ fontSize: 12, lineHeight: 19, color: colors.textPrimary }}>
                    • Base Salary {formatTaka(FIXED_BASE_SALARY)}: only paid once you cross {PASS_MARK_POINTS} points.
                  </Text>
                  <Text style={{ marginTop: 8, fontSize: 12, lineHeight: 19, color: colors.textPrimary }}>
                    • Mobile Bill Allowance {formatTaka(MOBILE_BILL)}: paid every month to cover your call credit.
                  </Text>
                  <Text style={{ marginTop: 8, fontSize: 12, lineHeight: 19, color: colors.textPrimary }}>
                    • Site Visit Allowance {formatTaka(SITE_VISIT_ALLOWANCE)}: paid every month to cover field travel costs.
                  </Text>
                  <Text style={{ marginTop: 8, fontSize: 12, lineHeight: 19, color: colors.textPrimary }}>
                    • Daily Attendance Allowance {formatTaka(DAILY_ALLOWANCE_RATE)}/day: paid for every day you actually
                    worked, up to 30 days.
                  </Text>
                  <Text style={{ marginTop: 8, fontSize: 12, lineHeight: 19, color: colors.textPrimary }}>
                    • Sales Commission {(COMMISSION_RATE * 100).toFixed(1)}%: paid on the total value of every deal you close.
                  </Text>
                </View>

                {onNavigateWallet && (
                  <Pressable
                    onPress={() => {
                      onClose();
                      onNavigateWallet();
                    }}
                    style={{ marginTop: 20, minHeight: 48, borderRadius: 12, backgroundColor: colors.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Wallet size={16} color="#FFFFFF" />
                    <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>Open My Wallet</Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={onClose}
                  style={{ marginTop: 10, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>Close</Text>
                </Pressable>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
