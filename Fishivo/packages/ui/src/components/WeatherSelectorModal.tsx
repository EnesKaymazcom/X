import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import Icon from './Icon';

interface WeatherCondition {
  id: string;
  name: string;
  icon: string;
  temperature?: number;
  description?: string;
}

interface WeatherSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (weather: WeatherCondition) => void;
}

const WeatherSelectorModal: React.FC<WeatherSelectorModalProps> = ({
  visible,
  onClose,
  onSelect
}) => {
  // Mock weather conditions
  const weatherConditions: WeatherCondition[] = [
    { id: '1', name: 'Güneşli', icon: 'sun', temperature: 25, description: 'Açık hava' },
    { id: '2', name: 'Bulutlu', icon: 'cloud', temperature: 22, description: 'Parçalı bulutlu' },
    { id: '3', name: 'Yağmurlu', icon: 'cloud-rain', temperature: 18, description: 'Hafif yağmur' },
    { id: '4', name: 'Fırtınalı', icon: 'cloud-lightning', temperature: 20, description: 'Gök gürültülü fırtına' },
    { id: '5', name: 'Sisli', icon: 'cloud', temperature: 16, description: 'Yoğun sis' },
    { id: '6', name: 'Rüzgarlı', icon: 'wind', temperature: 23, description: 'Güçlü rüzgar' },
  ];

  const renderWeatherCondition = ({ item }: { item: WeatherCondition }) => (
    <TouchableOpacity
      style={styles.weatherItem}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <View style={styles.weatherIcon}>
        <Icon name={item.icon} size={32} />
      </View>
      <View style={styles.weatherInfo}>
        <Text style={styles.weatherName}>{item.name}</Text>
        <Text style={styles.weatherDescription}>{item.description}</Text>
      </View>
      <View style={styles.temperature}>
        <Text style={styles.temperatureText}>{item.temperature}°C</Text>
      </View>
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
            <Text style={styles.title}>Hava Durumu Seç</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={24} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={weatherConditions}
            renderItem={renderWeatherCondition}
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
  weatherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  weatherIcon: {
    width: 50,
    alignItems: 'center',
    marginRight: 16,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  weatherDescription: {
    fontSize: 14,
    color: '#666',
  },
  temperature: {
    alignItems: 'center',
  },
  temperatureText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default WeatherSelectorModal;