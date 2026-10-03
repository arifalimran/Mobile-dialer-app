import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';

import type { BusinessVertical, LeadContact } from '../callingTypes';
import { BUSINESS_VERTICALS, VERTICAL_BADGE_STYLES } from '../constants/verticalOptions';
import { maskPhoneNumber } from '../utils/maskPhoneNumber';

interface AddLeadSheetProps {
  visible: boolean;
  onClose: () => void;
  onAddLead: (lead: LeadContact) => void;
}

export const AddLeadSheet: React.FC<AddLeadSheetProps> = ({ visible, onClose, onAddLead }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vertical, setVertical] = useState<BusinessVertical>('Land Sharing');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');

  const isValid = name.trim().length > 0 && phoneNumber.replace(/\D/g, '').length >= 10;

  const resetForm = () => {
    setName('');
    setPhoneNumber('');
    setVertical('Land Sharing');
    setBudget('');
    setLocation('');
  };

  const handleClose = () => {
    Keyboard.dismiss();
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!isValid) return;
    Keyboard.dismiss();

    const lead: LeadContact = {
      id: `lead-custom-${Date.now()}`,
      name: name.trim(),
      vertical,
      location: location.trim() || 'Not specified',
      budget: budget.trim() || 'Not specified',
      maskedPhoneNumber: maskPhoneNumber(phoneNumber),
      rawPhoneNumber: phoneNumber.trim(),
      source: 'Field Agent Entry',
    };

    onAddLead(lead);
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="max-h-[90%] rounded-t-3xl border-t border-slate-800 bg-slate-950 p-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-white">Add Custom Lead</Text>
              <Pressable
                onPress={handleClose}
                className="h-10 w-10 items-center justify-center rounded-full bg-slate-900"
              >
                <X size={18} color="#e2e8f0" />
              </Pressable>
            </View>

            <ScrollView
              className="mt-4"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text className="text-xs font-medium text-slate-400">CLIENT NAME</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                placeholderTextColor="#475569"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                className="mt-2 min-h-[48px] rounded-xl border border-slate-800 bg-slate-900 px-4 text-base text-white"
              />

              <Text className="mt-4 text-xs font-medium text-slate-400">PHONE NUMBER</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="+8801XXXXXXXXX"
                placeholderTextColor="#475569"
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                className="mt-2 min-h-[48px] rounded-xl border border-slate-800 bg-slate-900 px-4 text-base text-white"
              />

          <Text className="mt-4 text-xs font-medium text-slate-400">VERTICAL</Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {BUSINESS_VERTICALS.map((option) => {
              const isSelected = option === vertical;
              const style = VERTICAL_BADGE_STYLES[option];
              return (
                <Pressable
                  key={option}
                  onPress={() => setVertical(option)}
                  className={`min-h-[40px] items-center justify-center rounded-full border px-4 ${
                    isSelected ? style.container : 'border-slate-800 bg-slate-900'
                  }`}
                >
                  <Text className={`text-xs font-medium ${isSelected ? style.text : 'text-slate-400'}`}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

              <Text className="mt-4 text-xs font-medium text-slate-400">BUDGET</Text>
              <TextInput
                value={budget}
                onChangeText={setBudget}
                placeholder="৳"
                placeholderTextColor="#475569"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                className="mt-2 min-h-[48px] rounded-xl border border-slate-800 bg-slate-900 px-4 text-base text-white"
              />

              <Text className="mt-4 text-xs font-medium text-slate-400">LOCATION</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Area, City"
                placeholderTextColor="#475569"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                className="mt-2 min-h-[48px] rounded-xl border border-slate-800 bg-slate-900 px-4 text-base text-white"
              />

              <Pressable
                onPress={handleSubmit}
                disabled={!isValid}
                className={`mb-4 mt-6 min-h-[48px] items-center justify-center rounded-xl ${
                  isValid ? 'bg-sky-600' : 'bg-sky-900'
                }`}
              >
                <Text className="text-base font-semibold text-white">Add &amp; Call Now</Text>
              </Pressable>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};
