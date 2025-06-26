import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import Icon from './Icon';

interface FishingTechnique {
  id: string;
  name: string;
  description?: string;
}

interface FishingTechniqueSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  techniques: FishingTechnique[];
  onSelect: (technique: FishingTechnique) => void;
}

const FishingTechniqueSelectorModal: React.FC<FishingTechniqueSelectorModalProps> = ({
  visible,
  onClose,
  techniques,
  onSelect
}) => {
  const renderTechnique = ({ item }: { item: FishingTechnique }) => (
    <TouchableOpacity
      style={styles.techniqueItem}
      onPress={() => onSelect(item)}
    >
      <Text style={styles.techniqueName}>{item.name}</Text>
      {item.description && (
        <Text style={styles.techniqueDescription}>{item.description}</Text>
      )}
    </TouchableOpacity>
  );

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
            <Text style={styles.title}>Balık Tutma Tekniği Seç</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={24} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={techniques}
            renderItem={renderTechnique}
            keyExtractor={(item) => item.id}
            style={styles.list}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  list: {
    padding: 20,
  },
  techniqueItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  techniqueName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  techniqueDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default FishingTechniqueSelectorModal;