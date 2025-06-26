import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Icon from './Icon';

interface PhotoPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
}

const PhotoPickerModal: React.FC<PhotoPickerModalProps> = ({
  visible,
  onClose,
  onCamera,
  onGallery
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Fotoğraf Seç</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={24} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.options}>
            <TouchableOpacity style={styles.option} onPress={onCamera}>
              <Icon name="camera" size={32} />
              <Text style={styles.optionText}>Kamera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.option} onPress={onGallery}>
              <Icon name="image" size={32} />
              <Text style={styles.optionText}>Galeri</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  option: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    minWidth: 100,
  },
  optionText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PhotoPickerModal;