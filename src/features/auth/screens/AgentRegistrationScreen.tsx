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
  /** Optional: lets the wizard be reached from `LoginScreen` and return there without completing. */
  onBack?: () => void;
}

/**
 * Module 7: 3-Step KYC Agent Registration Wizard.
 * Submission sets `kycStatus: 'PENDING_VERIFICATION'` in `useAuthStore` —
 * see that file's header comment for why dialer access is NOT hard-blocked
 * in this front-end-only build.
 */
export const AgentRegistrationScreen: React.FC<AgentRegistrationScreenProps> = ({ onComplete, onBack }) => {
  const submitRegistration = useAuthStore((state) => state.submitRegistration);
  const [step, setStep] = useState(1);
  const [activePicker, setActivePicker] = useState<PickerTarget>(null);
  const [isDobPickerVisible, setIsDobPickerVisible] = useState(false);

  // Step 1
  const [legalName, setLegalName] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [occupation, setOccupation] = useState<Occupation>('Student');
  const [workPreference, setWorkPreference] = useState<WorkPreference>('PART_TIME');

  // Step 2
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [permanentAddress, setPermanentAddress] = useState<AddressDetails>(EMPTY_ADDRESS);
  const [presentAddress, setPresentAddress] = useState<AddressDetails>(EMPTY_ADDRESS);
  const [sameAsPermanent, setSameAsPermanent] = useState(false);

  // Step 3
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
    // Let the keyboard finish closing before this screen unmounts.
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-950"
    >
      <View className="flex-1 px-5 pt-6">
        <View className="flex-row items-center">
          {onBack && (
            <Pressable onPress={onBack} className="mr-2 h-10 w-10 items-center justify-center rounded-full">
              <ChevronLeft size={20} color="#94a3b8" />
            </Pressable>
          )}
          <ShieldCheck size={22} color="#38bdf8" />
          <Text className="ml-2 text-xl font-bold tracking-tight text-white">Agent KYC Registration</Text>
        </View>

        <View className="mt-5 flex-row items-center">
          {[1, 2, 3].map((s) => (
            <View key={s} className="mr-2 flex-1 flex-row items-center">
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${
                  s <= step ? 'bg-sky-600' : 'bg-slate-800'
                }`}
              >
                <Text className="text-xs font-bold text-white">{s}</Text>
              </View>
              {s < 3 && (
                <View className={`ml-2 h-1 flex-1 rounded-full ${s < step ? 'bg-sky-600' : 'bg-slate-800'}`} />
              )}
            </View>
          ))}
        </View>

        <ScrollView
          className="mt-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {step === 1 && (
            <View>
              <InputField
                label="Legal Name (as per NID)"
                required
                value={legalName}
                onChangeText={setLegalName}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />

              <InputField
                label="NID Number"
                required
                value={nidNumber}
                onChangeText={setNidNumber}
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                error={nidError && 'NID must be exactly 10, 13, or 17 digits.'}
              />

              <Text className="mt-5 text-xs font-medium text-slate-400">
                DATE OF BIRTH<Text className="font-bold text-rose-500"> *</Text>
              </Text>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setTimeout(() => setIsDobPickerVisible(true), 250);
                }}
                className={`mt-2 min-h-[52px] flex-row items-center justify-between rounded-xl border bg-slate-900 px-4 ${
                  dobError ? 'border-rose-700' : 'border-white/10'
                }`}
              >
                <Text className={dateOfBirth ? 'font-mono text-base tracking-wide text-white' : 'text-slate-500'}>
                  {dateOfBirth || 'Tap to select date of birth'}
                </Text>
                <ChevronDown size={18} color="#94a3b8" />
              </Pressable>
              {dobError && (
                <Text className="mt-1 text-xs text-rose-400">
                  Must be a valid date and agent must be 18 years or older.
                </Text>
              )}

              <Text className="mt-4 text-xs font-medium text-slate-400">GENDER</Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
                {GENDERS.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setGender(option)}
                    className={`min-h-[40px] items-center justify-center rounded-full border px-4 ${
                      gender === option ? 'border-sky-600 bg-sky-950' : 'border-slate-800 bg-slate-900'
                    }`}
                  >
                    <Text className={`text-sm ${gender === option ? 'text-sky-400' : 'text-slate-400'}`}>
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text className="mt-4 text-xs font-medium text-slate-400">OCCUPATION</Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
                {OCCUPATIONS.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setOccupation(option)}
                    className={`min-h-[40px] items-center justify-center rounded-full border px-4 ${
                      occupation === option ? 'border-sky-600 bg-sky-950' : 'border-slate-800 bg-slate-900'
                    }`}
                  >
                    <Text className={`text-sm ${occupation === option ? 'text-sky-400' : 'text-slate-400'}`}>
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text className="mt-4 text-xs font-medium text-slate-400">WORK PREFERENCE</Text>
              <View className="mt-2 flex-row gap-2">
                {WORK_PREFERENCES.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => setWorkPreference(option.value)}
                    className={`min-h-[40px] flex-1 items-center justify-center rounded-full border ${
                      workPreference === option.value
                        ? 'border-sky-600 bg-sky-950'
                        : 'border-slate-800 bg-slate-900'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        workPreference === option.value ? 'text-sky-400' : 'text-slate-400'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <InputField
                label="Phone Number"
                required
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />

              <InputField
                label="Email"
                required
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />

              <Text className="mt-5 text-sm font-semibold text-white">Permanent Address</Text>

              <Text className="mt-3 text-xs font-medium text-slate-400">DIVISION</Text>
              <Pressable
                onPress={() => setActivePicker('permanent-division')}
                className="mt-2 min-h-[48px] flex-row items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4"
              >
                <Text className={permanentAddress.division ? 'text-white' : 'text-slate-500'}>
                  {permanentAddress.division || 'Select division'}
                </Text>
                <ChevronDown size={18} color="#94a3b8" />
              </Pressable>

              <Text className="mt-4 text-xs font-medium text-slate-400">DISTRICT</Text>
              <Pressable
                onPress={() => permanentAddress.division && setActivePicker('permanent-district')}
                className="mt-2 min-h-[48px] flex-row items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4"
              >
                <Text className={permanentAddress.district ? 'text-white' : 'text-slate-500'}>
                  {permanentAddress.district || 'Select district'}
                </Text>
                <ChevronDown size={18} color="#94a3b8" />
              </Pressable>

              <Text className="mt-4 text-xs font-medium text-slate-400">THANA / UPAZILA</Text>
              <Pressable
                onPress={() => permanentAddress.district && setActivePicker('permanent-thana')}
                className="mt-2 min-h-[48px] flex-row items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4"
              >
                <Text className={permanentAddress.thana ? 'text-white' : 'text-slate-500'}>
                  {permanentAddress.thana || 'Select thana / upazila'}
                </Text>
                <ChevronDown size={18} color="#94a3b8" />
              </Pressable>

              <Text className="mt-4 text-xs font-medium text-slate-400">ROAD / VILLAGE</Text>
              <TextInput
                value={permanentAddress.roadOrVillage}
                onChangeText={(value) => updatePermanentField('roadOrVillage', value)}
                placeholder="House/Road no. or village name"
                placeholderTextColor="#475569"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                className="mt-2 min-h-[48px] rounded-xl border border-white/10 bg-slate-900 px-4 text-base text-white"
              />

              <Pressable
                onPress={handleToggleSameAsPermanent}
                className="mt-5 flex-row items-center"
              >
                <View
                  className={`h-6 w-6 items-center justify-center rounded border ${
                    sameAsPermanent ? 'border-sky-600 bg-sky-600' : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {sameAsPermanent && <Text className="text-xs font-bold text-white">✓</Text>}
                </View>
                <Text className="ml-2 text-sm text-slate-300">Present address same as permanent</Text>
              </Pressable>

              {!sameAsPermanent && (
                <View className="mt-4">
                  <Text className="text-sm font-semibold text-white">Present Address</Text>
                  <InputField
                    label="Division"
                    value={presentAddress.division}
                    onChangeText={(value) =>
                      setPresentAddress((previous) => ({ ...previous, division: value }))
                    }
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                  <InputField
                    label="District"
                    value={presentAddress.district}
                    onChangeText={(value) =>
                      setPresentAddress((previous) => ({ ...previous, district: value }))
                    }
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                  <InputField
                    label="Thana / Upazila"
                    value={presentAddress.thana}
                    onChangeText={(value) =>
                      setPresentAddress((previous) => ({ ...previous, thana: value }))
                    }
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                  <InputField
                    label="Road / Village"
                    value={presentAddress.roadOrVillage}
                    onChangeText={(value) =>
                      setPresentAddress((previous) => ({ ...previous, roadOrVillage: value }))
                    }
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </View>
              )}
            </View>
          )}

          {step === 3 && (
            <View>
              <Text className="text-sm font-semibold text-white">Reference Person</Text>

              <InputField
                label="Full Name"
                required
                value={referenceName}
                onChangeText={setReferenceName}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />

              <InputField
                label="Contact Phone"
                required
                value={referencePhone}
                onChangeText={setReferencePhone}
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />

              <InputField
                label="Full Address"
                required
                value={referenceAddress}
                onChangeText={setReferenceAddress}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <View className="mt-5 rounded-xl border border-amber-800 bg-amber-950/40 p-4">
                <Text className="text-xs text-amber-200">
                  Submitting sets your status to Pending Verification. Head Office will review
                  your NID and reference details before assigning a corporate SIM line.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View className="flex-row gap-3 pb-4 pt-2">
          {step > 1 && (
            <Pressable
              onPress={() => setStep((previous) => previous - 1)}
              className="min-h-[48px] flex-1 items-center justify-center rounded-xl border border-slate-800 bg-slate-900"
            >
              <Text className="text-base font-semibold text-slate-300">Back</Text>
            </Pressable>
          )}

          {step < 3 ? (
            <Pressable
              onPress={handleNext}
              className="min-h-[48px] flex-1 items-center justify-center rounded-xl bg-sky-600"
            >
              <Text className="text-base font-semibold text-white">Next</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSubmit}
              className="min-h-[48px] flex-1 items-center justify-center rounded-xl bg-emerald-600"
            >
              <Text className="text-base font-semibold text-white">Submit Registration</Text>
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
            const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
              date.getDate(),
            ).padStart(2, '0')}`;
            setDateOfBirth(iso);
            setIsDobPickerVisible(false);
          }}
          onClose={() => setIsDobPickerVisible(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
};
