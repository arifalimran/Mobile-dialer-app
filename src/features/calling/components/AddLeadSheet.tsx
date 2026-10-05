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

import { useAppTheme } from '../../../theme/ThemeContext';
import type { BusinessVertical, CustomerType, LeadContact } from '../callingTypes';
import { BUSINESS_VERTICALS, VERTICAL_BADGE_STYLES } from '../constants/verticalOptions';
import { maskPhoneNumber } from '../utils/maskPhoneNumber';

interface AddLeadSheetProps {
  visible: boolean;
  onClose: () => void;
  onAddLead: (lead: LeadContact) => void;
}

export const AddLeadSheet: React.FC<AddLeadSheetProps> = ({ visible, onClose, onAddLead }) => {
  const { colors } = useAppTheme();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('Individual');
  const [companyName, setCompanyName] = useState('');
  const [designation, setDesignation] = useState('');
  const [vertical, setVertical] = useState<BusinessVertical>('Land Sharing');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [homeAddress, setHomeAddress] = useState('');

  const customerTypes: CustomerType[] = ['Individual', 'Corporate', 'Investor', 'End-User'];

  const isValid = name.trim().length > 0 && phoneNumber.replace(/\D/g, '').length >= 10;

  const resetForm = () => {
    setName('');
    setPhoneNumber('');
    setCustomerType('Individual');
    setCompanyName('');
    setDesignation('');
    setVertical('Land Sharing');
    setBudget('');
    setLocation('');
    setHomeAddress('');
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
      customerType,
      companyName: companyName.trim() || undefined,
      designation: designation.trim() || undefined,
      homeAddress: homeAddress.trim() || undefined,
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
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ maxHeight: '90%', borderTopWidth: 1, borderTopColor: colors.border, borderRadius: 24, backgroundColor: colors.card, padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>Add Custom Lead</Text>
              <Pressable
                onPress={handleClose}
                style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colors.subpanel }}
              >
                <X size={18} color={colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView
              style={{ marginTop: 16 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: colors.textSecondary }}>CLIENT NAME</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                placeholderTextColor={colors.textSecondary}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                style={{ marginTop: 8, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 16, fontSize: 16, color: colors.textPrimary }}
              />

              <Text style={{ marginTop: 16, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: colors.textSecondary }}>PHONE NUMBER</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="+8801XXXXXXXXX"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                style={{ marginTop: 8, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 16, fontSize: 16, color: colors.textPrimary }}
              />

              <Text style={{ marginTop: 16, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: colors.textSecondary }}>CUSTOMER TYPE</Text>
              <View style={{ marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {customerTypes.map((option) => {
                  const isSelected = option === customerType;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setCustomerType(option)}
                      style={{ minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: isSelected ? colors.subpanel : colors.card, paddingHorizontal: 14 }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: isSelected ? colors.accent : colors.textSecondary }}>
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={{ marginTop: 16, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: colors.textSecondary }}>COMPANY / BUSINESS</Text>
              <TextInput
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="Company name"
                placeholderTextColor={colors.textSecondary}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                style={{ marginTop: 8, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 16, fontSize: 16, color: colors.textPrimary }}
              />

              <Text style={{ marginTop: 16, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: colors.textSecondary }}>DESIGNATION</Text>
              <TextInput
                value={designation}
                onChangeText={setDesignation}
                placeholder="Job title / role"
                placeholderTextColor={colors.textSecondary}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                style={{ marginTop: 8, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 16, fontSize: 16, color: colors.textPrimary }}
              />

              <Text style={{ marginTop: 16, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: colors.textSecondary }}>VERTICAL</Text>
              <View style={{ marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {BUSINESS_VERTICALS.map((option) => {
                  const isSelected = option === vertical;
                  const style = VERTICAL_BADGE_STYLES[option];
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setVertical(option)}
                      style={{ minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999, borderWidth: 1, borderColor: isSelected ? colors.border : colors.border, backgroundColor: isSelected ? colors.subpanel : colors.card, paddingHorizontal: 14 }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: isSelected ? style.text : colors.textSecondary }}>
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={{ marginTop: 16, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: colors.textSecondary }}>BUDGET</Text>
              <TextInput
                value={budget}
                onChangeText={setBudget}
                placeholder="৳"
                placeholderTextColor={colors.textSecondary}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                style={{ marginTop: 8, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 16, fontSize: 16, color: colors.textPrimary }}
              />

              <Text style={{ marginTop: 16, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: colors.textSecondary }}>LOCATION</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Area, City"
                placeholderTextColor={colors.textSecondary}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                style={{ marginTop: 8, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 16, fontSize: 16, color: colors.textPrimary }}
              />

              <Text style={{ marginTop: 16, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: colors.textSecondary }}>HOME ADDRESS (OPTIONAL)</Text>
              <TextInput
                value={homeAddress}
                onChangeText={setHomeAddress}
                placeholder="House, road, thana"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                style={{ marginTop: 8, minHeight: 88, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: colors.textPrimary }}
              />

              <Pressable
                onPress={handleSubmit}
                disabled={!isValid}
                style={{ marginBottom: 16, marginTop: 24, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: isValid ? colors.accent : colors.subpanel }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: isValid ? '#FFFFFF' : colors.textSecondary }}>Add &amp; Call Now</Text>
              </Pressable>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};
