import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChevronDown, ChevronLeft, ShieldCheck } from 'lucide-react-native';

import { SelectModal } from '../../../components/SelectModal';
import { InputField } from '../../../components/ui/InputField';
import { DatePickerModal } from '../../../components/ui/DatePickerModal';
import { useAppTheme } from '../../../theme/ThemeContext';
import { useAuthStore } from '../hooks/useAuthStore';
import {
  DIVISIONS,
  getDistricts,
  getThanas,
} from '../constants/bangladeshAddressData';
import { isAtLeast18YearsOld, isIsoDateShape, isValidNid } from '../utils/validateNid';
import type {
  AddressDetails,
  AgentProfile,
  Gender,
  Occupation,
  WorkPreference,
} from '../authTypes';
import { EMPTY_ADDRESS } from '../authTypes';

const GENDERS: Gender[] = ['Male', 'Female', 'Other'];
const OCCUPATIONS: Occupation[] = ['Student', 'Housewife', 'Job Holder', 'Freelancer', 'Business'];
const WORK_PREFERENCES: { value: WorkPreference; label: string }[] = [
  { value: 'PART_TIME', label: 'Part-Time' },
  { value: 'FULL_TIME', label: 'Full-Time' },
];

type AddressField = 'division' | 'district' | 'thana' | 'roadOrVillage';
type PickerTarget = 'permanent-division' | 'permanent-district' | 'permanent-thana' | null;

interface AgentRegistrationScreenProps {
  onComplete: () => void;
  onBack?: () => void;
}

export const AgentRegistrationScreen: React.FC<AgentRegistrationScreenProps> = ({ onComplete, onBack }) => {
  const { colors } = useAppTheme();
  const submitRegistration = useAuthStore((state) => state.submitRegistration);
  const [step, setStep] = useState(1);
  const [activePicker, setActivePicker] = useState<PickerTarget>(null);
  const [isDobPickerVisible, setIsDobPickerVisible] = useState(false);

  const [legalName, setLegalName] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [occupation, setOccupation] = useState<Occupation>('Student');
  const [workPreference, setWorkPreference] = useState<WorkPreference>('PART_TIME');

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [permanentAddress, setPermanentAddress] = useState<AddressDetails>(EMPTY_ADDRESS);
  const [presentAddress, setPresentAddress] = useState<AddressDetails>(EMPTY_ADDRESS);
  const [sameAsPermanent, setSameAsPermanent] = useState(false);

  const [referenceName, setReferenceName] = useState('');
  const [referencePhone, setReferencePhone] = useState('');
  const [referenceAddress, setReferenceAddress] = useState('');

  const nidError = nidNumber.length > 0 && !isValidNid(nidNumber);
  const dobError =
    dateOfBirth.length > 0 &&
    (!isIsoDateShape(dateOfBirth) || !isAtLeast18YearsOld(dateOfBirth));

  const isStep1Valid =
    legalName.trim().length > 1 &&
    isValidNid(nidNumber) &&
    isIsoDateShape(dateOfBirth) &&
    isAtLeast18YearsOld(dateOfBirth);

  const isStep2Valid =
    phone.trim().length >= 11 &&
    email.includes('@') &&
    permanentAddress.division.length > 0 &&
    permanentAddress.district.length > 0 &&
    permanentAddress.thana.length > 0 &&
    permanentAddress.roadOrVillage.trim().length > 0;

  const isStep3Valid =
    referenceName.trim().length > 1 &&
    referencePhone.trim().length >= 11 &&
    referenceAddress.trim().length > 3;

  const updatePermanentField = (field: AddressField, value: string) => {
    setPermanentAddress((previous) => {
      const next = { ...previous, [field]: value };
      if (field === 'division') {
        next.district = '';
        next.thana = '';
      }
      if (field === 'district') {
        next.thana = '';
      }
      return next;
    });
  };

  const handleToggleSameAsPermanent = () => {
    const next = !sameAsPermanent;
    setSameAsPermanent(next);
    if (next) setPresentAddress(permanentAddress);
  };

  const handleNext = () => {
    if (step === 1 && !isStep1Valid) {
      Alert.alert(
        'Missing details',
        'Enter legal name, a 10, 13, or 17 digit NID, and a date of birth for someone 18 or older.',
      );
      return;
    }
    if (step === 2 && !isStep2Valid) {
      Alert.alert('Missing details', 'Enter phone, email, and the full permanent address.');
      return;
    }
    setStep((previous) => previous + 1);
  };

  const handleSubmit = () => {
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      Alert.alert('Registration incomplete', 'Fill every required field before submitting.');
      return;
    }
    Keyboard.dismiss();

    const profile: Omit<AgentProfile, 'kycStatus' | 'submittedAt'> = {
      legalName: legalName.trim(),
      nidNumber,
      dateOfBirth,
      gender,
      occupation,
      workPreference,
      phone: phone.trim(),
      email: email.trim(),
      permanentAddress,
      presentAddress: sameAsPermanent ? permanentAddress : presentAddress,
      reference: {
        fullName: referenceName.trim(),
        contactPhone: referencePhone.trim(),
        fullAddress: referenceAddress.trim(),
      },
      role: 'MICRO_CALLER',
    };

    submitRegistration(profile);
    setTimeout(onComplete, 350);
  };

  const pickerOptions =
    activePicker === 'permanent-division'
      ? [...DIVISIONS]
      : activePicker === 'permanent-district'
        ? getDistricts(permanentAddress.division)
        : activePicker === 'permanent-thana'
          ? getThanas(permanentAddress.district)
          : [];

  const pickerTitle =
    activePicker === 'permanent-division'
      ? 'Select Division'
      : activePicker === 'permanent-district'
        ? 'Select District'
        : 'Select Thana / Upazila';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {onBack && (
            <Pressable onPress={onBack} style={{ marginRight: 8, width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={20} color={colors.textSecondary} />
            </Pressable>
          )}
          <ShieldCheck size={22} color={colors.brassAccent} />
          <Text style={{ marginLeft: 8, fontSize: 22, fontWeight: '800', letterSpacing: 0.4, color: colors.textPrimary }}>Agent KYC Registration</Text>
        </View>

        <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: s < 3 ? 8 : 0 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: s <= step ? colors.brassAccent : colors.subpanel,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: s <= step ? '#0F172A' : colors.textSecondary }}>{s}</Text>
              </View>
              {s < 3 && (
                <View style={{ flex: 1, height: 2, borderRadius: 999, marginLeft: 8, backgroundColor: s < step ? colors.brassAccent : colors.subpanel }} />
              )}
            </View>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }} style={{ marginTop: 20 }}>
          {step === 1 && (
            <View>
              <InputField label="Legal Name (as per NID)" required value={legalName} onChangeText={setLegalName} returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} />
              <InputField label="NID Number" required value={nidNumber} onChangeText={setNidNumber} keyboardType="number-pad" returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} error={nidError && 'NID must be exactly 10, 13, or 17 digits.'} />

              <Text style={{ marginTop: 20, fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>DATE OF BIRTH</Text>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setTimeout(() => setIsDobPickerVisible(true), 250);
                }}
                style={{
                  marginTop: 10,
                  minHeight: 52,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: dobError ? '#F87171' : colors.border,
                  backgroundColor: colors.subpanel,
                  paddingHorizontal: 16,
                }}
              >
                <Text style={{ fontFamily: 'monospace', fontSize: 15, letterSpacing: 0.8, color: dateOfBirth ? colors.textPrimary : colors.textSecondary }}>
                  {dateOfBirth || 'Tap to select date of birth'}
                </Text>
                <ChevronDown size={18} color={colors.textSecondary} />
              </Pressable>
              {dobError && <Text style={{ marginTop: 6, color: '#F87171', fontSize: 12 }}>Must be a valid date and agent must be 18 years or older.</Text>}

              <Text style={{ marginTop: 20, fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>GENDER</Text>
              <View style={{ marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {GENDERS.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setGender(option)}
                    style={{
                      minHeight: 40,
                      paddingHorizontal: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: gender === option ? colors.brassAccent : colors.border,
                      backgroundColor: gender === option ? 'rgba(216,162,67,0.12)' : colors.subpanel,
                    }}
                  >
                    <Text style={{ fontSize: 14, color: gender === option ? colors.brassAccent : colors.textSecondary }}>{option}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={{ marginTop: 20, fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>OCCUPATION</Text>
              <View style={{ marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {OCCUPATIONS.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setOccupation(option)}
                    style={{
                      minHeight: 40,
                      paddingHorizontal: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: occupation === option ? colors.brassAccent : colors.border,
                      backgroundColor: occupation === option ? 'rgba(216,162,67,0.12)' : colors.subpanel,
                    }}
                  >
                    <Text style={{ fontSize: 14, color: occupation === option ? colors.brassAccent : colors.textSecondary }}>{option}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={{ marginTop: 20, fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>WORK PREFERENCE</Text>
              <View style={{ marginTop: 10, flexDirection: 'row', gap: 8 }}>
                {WORK_PREFERENCES.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => setWorkPreference(option.value)}
                    style={{
                      flex: 1,
                      minHeight: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: workPreference === option.value ? colors.brassAccent : colors.border,
                      backgroundColor: workPreference === option.value ? 'rgba(216,162,67,0.12)' : colors.subpanel,
                    }}
                  >
                    <Text style={{ fontSize: 14, color: workPreference === option.value ? colors.brassAccent : colors.textSecondary }}>{option.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <InputField label="Phone Number" required value={phone} onChangeText={setPhone} keyboardType="phone-pad" returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} />
              <InputField label="Email" required value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} />

              <Text style={{ marginTop: 20, fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>Permanent Address</Text>
              <Text style={{ marginTop: 14, fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>DIVISION</Text>
              <Pressable onPress={() => setActivePicker('permanent-division')} style={{ marginTop: 10, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 16 }}>
                <Text style={{ fontSize: 14, color: permanentAddress.division ? colors.textPrimary : colors.textSecondary }}>{permanentAddress.division || 'Select division'}</Text>
                <ChevronDown size={18} color={colors.textSecondary} />
              </Pressable>

              <Text style={{ marginTop: 16, fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>DISTRICT</Text>
              <Pressable onPress={() => permanentAddress.division && setActivePicker('permanent-district')} style={{ marginTop: 10, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 16 }}>
                <Text style={{ fontSize: 14, color: permanentAddress.district ? colors.textPrimary : colors.textSecondary }}>{permanentAddress.district || 'Select district'}</Text>
                <ChevronDown size={18} color={colors.textSecondary} />
              </Pressable>

              <Text style={{ marginTop: 16, fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>THANA / UPAZILA</Text>
              <Pressable onPress={() => permanentAddress.district && setActivePicker('permanent-thana')} style={{ marginTop: 10, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 16 }}>
                <Text style={{ fontSize: 14, color: permanentAddress.thana ? colors.textPrimary : colors.textSecondary }}>{permanentAddress.thana || 'Select thana / upazila'}</Text>
                <ChevronDown size={18} color={colors.textSecondary} />
              </Pressable>

              <Text style={{ marginTop: 16, fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>ROAD / VILLAGE</Text>
              <TextInput
                value={permanentAddress.roadOrVillage}
                onChangeText={(value) => updatePermanentField('roadOrVillage', value)}
                placeholder="House/Road no. or village name"
                placeholderTextColor={colors.textSecondary}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                style={{ marginTop: 10, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 16, color: colors.textPrimary, fontSize: 16 }}
              />

              <Pressable onPress={handleToggleSameAsPermanent} style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: sameAsPermanent ? colors.brassAccent : colors.border, backgroundColor: sameAsPermanent ? colors.brassAccent : colors.subpanel, alignItems: 'center', justifyContent: 'center' }}>
                  {sameAsPermanent && <Text style={{ color: '#0F172A', fontWeight: '800', fontSize: 12 }}>✓</Text>}
                </View>
                <Text style={{ marginLeft: 10, fontSize: 14, color: colors.textPrimary }}>Present address same as permanent</Text>
              </Pressable>

              {!sameAsPermanent && (
                <View style={{ marginTop: 20 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>Present Address</Text>
                  <InputField label="Division" value={presentAddress.division} onChangeText={(value) => setPresentAddress((previous) => ({ ...previous, division: value }))} returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} />
                  <InputField label="District" value={presentAddress.district} onChangeText={(value) => setPresentAddress((previous) => ({ ...previous, district: value }))} returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} />
                  <InputField label="Thana / Upazila" value={presentAddress.thana} onChangeText={(value) => setPresentAddress((previous) => ({ ...previous, thana: value }))} returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} />
                  <InputField label="Road / Village" value={presentAddress.roadOrVillage} onChangeText={(value) => setPresentAddress((previous) => ({ ...previous, roadOrVillage: value }))} returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} />
                </View>
              )}
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>Reference Person</Text>
              <InputField label="Full Name" required value={referenceName} onChangeText={setReferenceName} returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} />
              <InputField label="Contact Phone" required value={referencePhone} onChangeText={setReferencePhone} keyboardType="phone-pad" returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} />
              <InputField label="Full Address" required value={referenceAddress} onChangeText={setReferenceAddress} multiline numberOfLines={3} textAlignVertical="top" />

              <View style={{ marginTop: 20, borderRadius: 14, borderWidth: 1, borderColor: '#D8A243', backgroundColor: 'rgba(216,162,67,0.12)', padding: 14 }}>
                <Text style={{ fontSize: 12, lineHeight: 18, color: '#F4D39A' }}>
                  Submitting sets your status to Pending Verification. Head Office will review your NID and reference details before assigning a corporate SIM line.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 18, paddingTop: 8 }}>
          {step > 1 && (
            <Pressable onPress={() => setStep((previous) => previous - 1)} style={{ flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>Back</Text>
            </Pressable>
          )}

          {step < 3 ? (
            <Pressable onPress={handleNext} style={{ flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.brassAccent }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>Next</Text>
            </Pressable>
          ) : (
            <Pressable onPress={handleSubmit} style={{ flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#34D399' }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>Submit Registration</Text>
            </Pressable>
          )}
        </View>

        <SelectModal
          visible={activePicker !== null}
          title={pickerTitle}
          options={pickerOptions}
          selectedValue={
            activePicker === 'permanent-division'
              ? permanentAddress.division
              : activePicker === 'permanent-district'
                ? permanentAddress.district
                : permanentAddress.thana
          }
          onSelect={(value) => {
            if (activePicker === 'permanent-division') updatePermanentField('division', value);
            if (activePicker === 'permanent-district') updatePermanentField('district', value);
            if (activePicker === 'permanent-thana') updatePermanentField('thana', value);
          }}
          onClose={() => setActivePicker(null)}
        />

        <DatePickerModal
          visible={isDobPickerVisible}
          mode="date"
          title="Date of Birth"
          minAgeYears={18}
          onConfirm={(date) => {
            const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            setDateOfBirth(iso);
            setIsDobPickerVisible(false);
          }}
          onClose={() => setIsDobPickerVisible(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
};
