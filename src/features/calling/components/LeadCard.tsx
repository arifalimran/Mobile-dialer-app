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

import type { LeadContact } from '../callingTypes';
import { VERTICAL_BADGE_STYLES } from '../constants/verticalOptions';
import { PROJECT_SPEC_CATALOG } from '../constants/mockProjectCatalog';

interface LeadCardProps {
  lead: LeadContact;
  isConnecting: boolean;
  onStartCall: () => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, isConnecting, onStartCall }) => {
  const [isPitchExpanded, setIsPitchExpanded] = useState(false);
  const [isSpecExpanded, setIsSpecExpanded] = useState(false);
  const badgeStyle = VERTICAL_BADGE_STYLES[lead.vertical];
  const hasPitchContent = Boolean(lead.quickPitchScript || lead.objectionPointers?.length);
  const projectSpec = lead.projectSpecId ? PROJECT_SPEC_CATALOG[lead.projectSpecId] : undefined;

  return (
    <View className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <View className="flex-row items-center justify-between">
        <Text
          className="mr-3 flex-1 text-xl font-bold tracking-tight text-white"
          numberOfLines={1}
        >
          {lead.name}
        </Text>
        <View className={`shrink-0 rounded-full border px-3 py-1 ${badgeStyle.container}`}>
          <Text className={`text-xs font-medium ${badgeStyle.text}`}>{lead.vertical}</Text>
        </View>
      </View>

      <View className="mt-3 flex-row items-center">
        <Tag size={16} color="#94a3b8" />
        <Text className="ml-2 text-sm text-slate-400">{lead.source}</Text>
      </View>

      <View className="mt-2 flex-row items-center">
        <MapPin size={16} color="#94a3b8" />
        <Text className="ml-2 text-sm text-slate-400">{lead.location}</Text>
      </View>

      <View className="mt-2 flex-row items-center">
        <Wallet size={16} color="#94a3b8" />
        <Text className="ml-2 font-mono text-sm tracking-wide text-slate-400">{lead.budget}</Text>
      </View>

      <View className="mt-4 flex-row items-center rounded-xl border border-white/10 bg-slate-950 px-4 py-3">
        <Phone size={16} color="#64748b" />
        <Text
          selectable={false}
          className="ml-2 font-mono text-base tracking-wide text-slate-300"
        >
          {lead.maskedPhoneNumber}
        </Text>
      </View>

      {lead.lastCallbackNote && (
        <View className="mt-4 rounded-xl border border-amber-800 bg-amber-950/40 px-4 py-3">
          <View className="flex-row items-center">
            <Clock size={14} color="#fbbf24" />
            <Text className="ml-2 text-xs font-semibold text-amber-300">
              Last Talk Notes · Follow-up {new Date(lead.lastCallbackNote.scheduledFor).toLocaleString()}
            </Text>
          </View>
          <Text className="mt-1 text-sm text-amber-100">{lead.lastCallbackNote.note}</Text>
        </View>
      )}

      {projectSpec && (
        <View className="mt-4 rounded-xl border border-slate-800 bg-slate-950">
          <Pressable
            onPress={() => setIsSpecExpanded((previous) => !previous)}
            className="min-h-[48px] flex-row items-center justify-between px-4"
          >
            <View className="flex-row items-center">
              <Building2 size={16} color="#94a3b8" />
              <Text className="ml-2 text-sm font-medium text-slate-300">
                🏢 Project Specs &amp; Availability
              </Text>
            </View>
            {isSpecExpanded ? (
              <ChevronUp size={18} color="#94a3b8" />
            ) : (
              <ChevronDown size={18} color="#94a3b8" />
            )}
          </Pressable>

          {isSpecExpanded && (
            <View className="border-t border-slate-800 px-4 py-3">
              <Text className="text-sm font-semibold text-white">{projectSpec.projectName}</Text>
              <Text className="mt-1 text-xs text-slate-400">{projectSpec.exactLocation}</Text>

              <View className="mt-3 flex-row flex-wrap gap-x-4 gap-y-2">
                <Text className="text-xs text-slate-400">Road: {projectSpec.frontRoadWidth}</Text>
                <Text className="text-xs text-slate-400">Facing: {projectSpec.facing}</Text>
              </View>

              <Text className="mt-2 text-xs text-slate-400">Unit: {projectSpec.unitSize}</Text>
              <Text className="mt-1 text-xs text-emerald-400">{projectSpec.availability}</Text>

              {projectSpec.extraFeatures.length > 0 && (
                <View className="mt-3">
                  <Text className="text-xs font-semibold text-slate-500">EXTRA FEATURES</Text>
                  <View className="mt-1 flex-row flex-wrap gap-2">
                    {projectSpec.extraFeatures.map((feature) => (
                      <View key={feature} className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1">
                        <Text className="text-[11px] text-slate-300">{feature}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <Text className="mt-3 text-xs text-slate-400">📍 {projectSpec.nearestLandmark}</Text>
              <Text className="mt-2 text-xs text-slate-400">📄 {projectSpec.documentation}</Text>
              <Text className="mt-3 text-xs font-semibold text-sky-400">৳ <Text className="font-mono tracking-wide">{projectSpec.pricingTerms}</Text></Text>
            </View>
          )}
        </View>
      )}

      {hasPitchContent && (
        <View className="mt-4 rounded-xl border border-slate-800 bg-slate-950">
          <Pressable
            onPress={() => setIsPitchExpanded((previous) => !previous)}
            className="min-h-[48px] flex-row items-center justify-between px-4"
          >
            <View className="flex-row items-center">
              <FileText size={16} color="#94a3b8" />
              <Text className="ml-2 text-sm font-medium text-slate-300">
                Quick Pitch Script &amp; Objection Pointers
              </Text>
            </View>
            {isPitchExpanded ? (
              <ChevronUp size={18} color="#94a3b8" />
            ) : (
              <ChevronDown size={18} color="#94a3b8" />
            )}
          </Pressable>

          {isPitchExpanded && (
            <View className="border-t border-slate-800 px-4 py-3">
              {lead.quickPitchScript && (
                <Text className="text-sm leading-5 text-slate-300">{lead.quickPitchScript}</Text>
              )}

              {lead.objectionPointers && lead.objectionPointers.length > 0 && (
                <View className="mt-3">
                  <Text className="text-xs font-semibold text-slate-500">OBJECTION POINTERS</Text>
                  {lead.objectionPointers.map((pointer) => (
                    <Text key={pointer} className="mt-1 text-sm text-slate-400">
                      • {pointer}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      <Pressable
        onPress={onStartCall}
        disabled={isConnecting}
        className={`mt-5 min-h-[48px] flex-row items-center justify-center rounded-xl ${
          isConnecting ? 'bg-sky-800' : 'bg-sky-600'
        }`}
      >
        {isConnecting ? (
          <>
            <ActivityIndicator color="#e0f2fe" />
            <Text className="ml-2 text-base font-semibold text-white">Connecting…</Text>
          </>
        ) : (
          <>
            <Phone size={20} color="#ffffff" />
            <Text className="ml-2 text-base font-semibold text-white">Start Masked Call</Text>
          </>
        )}
      </Pressable>
    </View>
  );
};
