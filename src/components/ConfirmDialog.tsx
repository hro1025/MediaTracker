import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

export function ConfirmDialog(props: {
  visible: boolean;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}): React.JSX.Element {
  const { visible, icon, title, message, confirmLabel, onConfirm, onCancel } =
    props;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.iconCircle}>
            <MaterialIcons name={icon} size={28} color="#f28b82" />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttons}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.cancel,
                pressed && styles.pressed,
              ]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.confirm,
                pressed && styles.pressed,
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1c1e25',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3a2326',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    color: '#9a9ca5',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    alignSelf: 'stretch',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 24,
  },
  cancel: {
    backgroundColor: '#2c2e36',
  },
  confirm: {
    backgroundColor: '#f28b82',
  },
  pressed: {
    opacity: 0.7,
  },
  cancelText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  confirmText: {
    color: '#121318',
    fontWeight: 'bold',
  },
});
