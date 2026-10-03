import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  MapPin,
  Phone,
  Tag,
  Wallet,
} from 'lucide-react-native';

import { useAppTheme } from '../../../theme/ThemeContext';
import type { LeadContact, MessageHistoryItem } from '../callingTypes';
import { VERTICAL_BADGE_STYLES } from '../constants/verticalOptions';
import { PROJECT_SPEC_CATALOG } from '../constants/mockProjectCatalog';
import { MessageComposerModal } from './MessageComposerModal';

interface LeadCardProps {
  lead: LeadContact;
  isConnecting: boolean;
  onStartCall: () => void;
  onRecordMessage?: (entry: MessageHistoryItem) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, isConnecting, onStartCall, onRecordMessage }) => {
  const { colors } = useAppTheme();
  const [isPitchExpanded, setIsPitchExpanded] = useState(false);
  const [isSpecExpanded, setIsSpecExpanded] = useState(false);
  const [isMessageComposerVisible, setIsMessageComposerVisible] = useState(false);
  const badgeStyle = VERTICAL_BADGE_STYLES[lead.vertical];
  const hasPitchContent = Boolean(lead.quickPitchScript || lead.objectionPointers?.length);
  const projectSpec = lead.projectSpecId ? PROJECT_SPEC_CATALOG[lead.projectSpecId] : undefined;

  return (
    <View style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text numberOfLines={1} style={{ flex: 1, marginRight: 12, fontSize: 22, fontWeight: '800', letterSpacing: 0.2, color: colors.textPrimary }}>
          {lead.name}
        </Text>
        <View style={{ flexShrink: 0, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 10, paddingVertical: 6 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textPrimary }}>{lead.vertical}</Text>
        </View>
      </View>

      <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
        <Tag size={16} color={colors.textSecondary} />
        <Text style={{ marginLeft: 8, fontSize: 14, color: colors.textSecondary }}>{lead.source}</Text>
      </View>

      <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
        <MapPin size={16} color={colors.textSecondary} />
        <Text style={{ marginLeft: 8, fontSize: 14, color: colors.textSecondary }}>{lead.location}</Text>
      </View>

      <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
        <Wallet size={16} color={colors.textSecondary} />
        <Text style={{ marginLeft: 8, fontSize: 14, fontFamily: 'monospace', color: colors.textSecondary }}>{lead.budget}</Text>
      </View>

      <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 16, paddingVertical: 12 }}>
        <Phone size={16} color={colors.textSecondary} />
        <Text selectable={false} style={{ marginLeft: 8, fontSize: 15, fontFamily: 'monospace', letterSpacing: 0.8, color: colors.textPrimary }}>
          {lead.maskedPhoneNumber}
        </Text>
      </View>

      {lead.lastCallbackNote && (
        <View style={{ marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.warning, backgroundColor: 'rgba(245,158,11,0.12)', padding: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Clock size={14} color={colors.warning} />
            <Text style={{ marginLeft: 8, fontSize: 11, fontWeight: '700', color: colors.warning }}>
              Last Talk Notes · Follow-up {new Date(lead.lastCallbackNote.scheduledFor).toLocaleString()}
            </Text>
          </View>
          <Text style={{ marginTop: 8, fontSize: 14, color: colors.textPrimary }}>{lead.lastCallbackNote.note}</Text>
        </View>
      )}

      {projectSpec && (
        <View style={{ marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel }}>
          <Pressable onPress={() => setIsSpecExpanded((previous) => !previous)} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Building2 size={16} color={colors.textSecondary} />
              <Text style={{ marginLeft: 8, fontSize: 14, color: colors.textSecondary }}>🏢 Project Specs &amp; Availability</Text>
            </View>
            {isSpecExpanded ? <ChevronUp size={18} color={colors.textSecondary} /> : <ChevronDown size={18} color={colors.textSecondary} />}
          </Pressable>

          {isSpecExpanded && (
            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingVertical: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>{projectSpec.projectName}</Text>
              <Text style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>{projectSpec.exactLocation}</Text>

              <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Road: {projectSpec.frontRoadWidth}</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Facing: {projectSpec.facing}</Text>
              </View>

              <Text style={{ marginTop: 8, fontSize: 12, color: colors.textSecondary }}>Unit: {projectSpec.unitSize}</Text>
              <Text style={{ marginTop: 4, fontSize: 12, color: colors.success }}>{projectSpec.availability}</Text>

              {projectSpec.extraFeatures.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>EXTRA FEATURES</Text>
                  <View style={{ marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {projectSpec.extraFeatures.map((feature) => (
                      <View key={feature} style={{ borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 8, paddingVertical: 4 }}>
                        <Text style={{ fontSize: 11, color: colors.textSecondary }}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <Text style={{ marginTop: 12, fontSize: 12, color: colors.textSecondary }}>📍 {projectSpec.nearestLandmark}</Text>
              <Text style={{ marginTop: 8, fontSize: 12, color: colors.textSecondary }}>📄 {projectSpec.documentation}</Text>
              <Text style={{ marginTop: 12, fontSize: 12, fontWeight: '700', color: colors.accent }}>৳ {projectSpec.pricingTerms}</Text>
            </View>
          )}
        </View>
      )}

      {hasPitchContent && (
        <View style={{ marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel }}>
          <Pressable onPress={() => setIsPitchExpanded((previous) => !previous)} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FileText size={16} color={colors.textSecondary} />
              <Text style={{ marginLeft: 8, fontSize: 14, color: colors.textSecondary }}>Quick Pitch Script &amp; Objection Pointers</Text>
            </View>
            {isPitchExpanded ? <ChevronUp size={18} color={colors.textSecondary} /> : <ChevronDown size={18} color={colors.textSecondary} />}
          </Pressable>

          {isPitchExpanded && (
            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingVertical: 12 }}>
              {lead.quickPitchScript && <Text style={{ fontSize: 14, lineHeight: 20, color: colors.textSecondary }}>{lead.quickPitchScript}</Text>}

              {lead.objectionPointers && lead.objectionPointers.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>OBJECTION POINTERS</Text>
                  {lead.objectionPointers.map((pointer) => (
                    <Text key={pointer} style={{ marginTop: 6, fontSize: 13, color: colors.textSecondary }}>
                      • {pointer}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      <View style={{ marginTop: 20, flexDirection: 'row', gap: 8 }}>
        <Pressable
          onPress={() => setIsMessageComposerVisible(true)}
          style={{ flex: 1, minHeight: 48, borderRadius: 12, backgroundColor: '#38BDF8', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
        >
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>💬 SMS</Text>
        </Pressable>
        <Pressable
          onPress={() => setIsMessageComposerVisible(true)}
          style={{ flex: 1, minHeight: 48, borderRadius: 12, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
        >
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>🟢 WhatsApp</Text>
        </Pressable>
      </View>

      <Pressable onPress={onStartCall} disabled={isConnecting} style={{ marginTop: 12, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: isConnecting ? colors.accent : colors.accent }}>
        {isConnecting ? (
          <>
            <ActivityIndicator color="#F7F3EE" />
            <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '700', color: '#F7F3EE' }}>Connecting…</Text>
          </>
        ) : (
          <>
            <Phone size={20} color="#F7F3EE" />
            <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '700', color: '#F7F3EE' }}>Start Masked Call</Text>
          </>
        )}
      </Pressable>

      <MessageComposerModal
        visible={isMessageComposerVisible}
        lead={{
          id: lead.id,
          name: lead.name,
          maskedPhoneNumber: lead.maskedPhoneNumber,
          rawPhoneNumber: lead.rawPhoneNumber,
          messageHistory: lead.messageHistory ?? [],
        }}
        onClose={() => setIsMessageComposerVisible(false)}
        onSendMessage={(entry) => {
          onRecordMessage?.(entry);
          setIsMessageComposerVisible(false);
        }}
      />
    </View>
  );
};
