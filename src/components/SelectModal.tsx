import React from 'react';
import { FlatList, Modal, Pressable, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Check } from 'lucide-react-native';

interface SelectModalProps {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

/**
 * Global primitive: an accessible bottom-sheet picker backed by a FlatList,
 * used anywhere a cascading dropdown (Division -> District -> Thana, shift
 * slot pickers, etc.) is needed, without pulling in a native picker library.
 */
export const SelectModal: React.FC<SelectModalProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/60">
          <TouchableWithoutFeedback>
            <View className="max-h-[70%] rounded-t-3xl border-t border-slate-800 bg-slate-950 p-5">
              <Text className="text-lg font-semibold text-white">{title}</Text>

              {options.length === 0 ? (
                <Text className="mt-4 text-sm text-slate-500">No options available yet.</Text>
              ) : (
                <FlatList
                  className="mt-3"
                  data={options}
                  keyExtractor={(item) => item}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => {
                        onSelect(item);
                        onClose();
                      }}
                      className="min-h-[48px] flex-row items-center justify-between border-b border-slate-900"
                    >
                      <Text className="text-base text-slate-200">{item}</Text>
                      {item === selectedValue && <Check size={18} color="#38bdf8" />}
                    </Pressable>
                  )}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
