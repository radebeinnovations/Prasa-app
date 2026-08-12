import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SelectFieldProps = {
  accessibilityLabel: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  value: string;
};

export function SelectField({
  accessibilityLabel,
  onChange,
  options,
  placeholder = '-SELECT-',
  value,
}: SelectFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={() => setVisible(true)}
        style={styles.field}
      >
        <Text numberOfLines={1} style={value ? styles.value : styles.placeholder}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#0076CB" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        onRequestClose={() => setVisible(false)}
        transparent
        visible={visible}
      >
        <Pressable onPress={() => setVisible(false)} style={styles.overlay}>
          <Pressable accessibilityViewIsModal style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{accessibilityLabel}</Text>
              <TouchableOpacity
                accessibilityLabel="Close selection"
                accessibilityRole="button"
                onPress={() => setVisible(false)}
              >
                <Ionicons name="close" size={26} color="#1E293B" />
              </TouchableOpacity>
            </View>
            {options.map((option) => (
              <TouchableOpacity
                accessibilityRole="button"
                key={option}
                onPress={() => {
                  onChange(option);
                  setVisible(false);
                }}
                style={styles.option}
              >
                <Text style={styles.optionText}>{option}</Text>
                {value === option ? (
                  <Ionicons name="checkmark-circle" size={22} color="#0076CB" />
                ) : null}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flex: 1.5,
    minHeight: 56,
    backgroundColor: '#F1F1F1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  value: {
    flex: 1,
    marginRight: 8,
    fontSize: 16,
    color: '#343434',
  },
  placeholder: {
    flex: 1,
    marginRight: 8,
    fontSize: 16,
    color: '#777777',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(2, 18, 43, 0.5)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 34,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  option: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  optionText: {
    fontSize: 16,
    color: '#334155',
  },
});
