import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import Icon from './Icon';

interface Equipment {
  id: string;
  name: string;
  type?: string;
  brand?: string;
}

interface EquipmentSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (equipment: Equipment[]) => void;
}

const EquipmentSelectorModal: React.FC<EquipmentSelectorModalProps> = ({
  visible,
  onClose,
  onSelect
}) => {
  const [selectedEquipment, setSelectedEquipment] = React.useState<Equipment[]>([]);
  
  // Mock equipment data
  const equipmentList: Equipment[] = [
    { id: '1', name: 'Spinning Rod', type: 'Rod', brand: 'Shimano' },
    { id: '2', name: 'Baitcasting Reel', type: 'Reel', brand: 'Daiwa' },
    { id: '3', name: 'Braided Line', type: 'Line', brand: 'PowerPro' },
    { id: '4', name: 'Jig Head', type: 'Lure', brand: 'Owner' },
    { id: '5', name: 'Soft Plastic', type: 'Lure', brand: 'Keitech' },
  ];

  const toggleEquipment = (equipment: Equipment) => {
    setSelectedEquipment(prev => {
      const isSelected = prev.find(item => item.id === equipment.id);
      if (isSelected) {
        return prev.filter(item => item.id !== equipment.id);
      } else {
        return [...prev, equipment];
      }
    });
  };

  const handleConfirm = () => {
    onSelect(selectedEquipment);
    onClose();
  };

  const renderEquipment = ({ item }: { item: Equipment }) => {
    const isSelected = selectedEquipment.find(eq => eq.id === item.id);
    
    return (
      <TouchableOpacity
        style={[styles.equipmentItem, isSelected && styles.selectedItem]}
        onPress={() => toggleEquipment(item)}
      >
        <View style={styles.equipmentInfo}>
          <Text style={styles.equipmentName}>{item.name}</Text>
          <Text style={styles.equipmentDetails}>{item.type} - {item.brand}</Text>
        </View>
        {isSelected && <Icon name="check" size={20} color="#007AFF" />}
      </TouchableOpacity>
    );
  };

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
            <Text style={styles.title}>Ekipman Seç</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={24} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={equipmentList}
            renderItem={renderEquipment}
            keyExtractor={(item) => item.id}
            style={styles.list}
          />
          
          <View style={styles.footer}>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Seçimi Onayla ({selectedEquipment.length})</Text>
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
  equipmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedItem: {
    backgroundColor: '#f0f8ff',
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  equipmentDetails: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EquipmentSelectorModal;