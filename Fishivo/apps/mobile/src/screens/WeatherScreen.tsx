import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Icon,
  ScreenContainer,
  CurrentWeatherCard,
  DailyForecastCard,
  FishingConditionsCard,
  HourlyForecast,
  WeatherDetailsGrid,
  WeatherErrorState,
  WeatherLoadingState,
} from '@fishivo/ui';
import { theme } from '@fishivo/shared';

const { width, height } = Dimensions.get('window');

interface WeatherScreenProps {
  navigation: any;
}

interface WeatherData {
  current: {
    temperature: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    pressure: number;
    visibility: number;
    uvIndex: number;
    feelsLike: number;
  };
  hourly: Array<{
    time: string;
    temperature: number;
    condition: string;
    icon: string;
    precipitation: number;
  }>;
  daily: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipitation: number;
    humidity: number;
    windSpeed: number;
  }>;
  fishingConditions: {
    overall: 'excellent' | 'good' | 'fair' | 'poor';
    barometricPressure: 'rising' | 'steady' | 'falling';
    windConditions: 'calm' | 'light' | 'moderate' | 'strong';
    waterConditions: 'clear' | 'choppy' | 'rough';
    bestTimes: string[];
    tips: string[];
  };
}

const WeatherScreen: React.FC<WeatherScreenProps> = ({ navigation }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState('İstanbul, Türkiye');

  // Mock weather data
  const mockWeatherData: WeatherData = {
    current: {
      temperature: 22,
      condition: 'Parçalı Bulutlu',
      icon: 'partly-cloudy',
      humidity: 65,
      windSpeed: 12,
      windDirection: 'KB',
      pressure: 1013,
      visibility: 10,
      uvIndex: 6,
      feelsLike: 24,
    },
    hourly: [
      { time: '14:00', temperature: 22, condition: 'Parçalı Bulutlu', icon: 'partly-cloudy', precipitation: 0 },
      { time: '15:00', temperature: 23, condition: 'Güneşli', icon: 'sunny', precipitation: 0 },
      { time: '16:00', temperature: 24, condition: 'Güneşli', icon: 'sunny', precipitation: 0 },
      { time: '17:00', temperature: 23, condition: 'Parçalı Bulutlu', icon: 'partly-cloudy', precipitation: 10 },
      { time: '18:00', temperature: 21, condition: 'Bulutlu', icon: 'cloudy', precipitation: 20 },
      { time: '19:00', temperature: 20, condition: 'Hafif Yağmur', icon: 'light-rain', precipitation: 40 },
    ],
    daily: [
      { date: 'Bugün', high: 24, low: 18, condition: 'Parçalı Bulutlu', icon: 'partly-cloudy', precipitation: 20, humidity: 65, windSpeed: 12 },
      { date: 'Yarın', high: 26, low: 19, condition: 'Güneşli', icon: 'sunny', precipitation: 0, humidity: 55, windSpeed: 8 },
      { date: 'Pazartesi', high: 25, low: 20, condition: 'Bulutlu', icon: 'cloudy', precipitation: 30, humidity: 70, windSpeed: 15 },
      { date: 'Salı', high: 23, low: 17, condition: 'Yağmurlu', icon: 'rainy', precipitation: 80, humidity: 85, windSpeed: 18 },
      { date: 'Çarşamba', high: 21, low: 16, condition: 'Fırtınalı', icon: 'stormy', precipitation: 90, humidity: 90, windSpeed: 25 },
      { date: 'Perşembe', high: 24, low: 18, condition: 'Parçalı Bulutlu', icon: 'partly-cloudy', precipitation: 10, humidity: 60, windSpeed: 10 },
      { date: 'Cuma', high: 27, low: 21, condition: 'Güneşli', icon: 'sunny', precipitation: 0, humidity: 50, windSpeed: 6 },
    ],
    fishingConditions: {
      overall: 'good',
      barometricPressure: 'steady',
      windConditions: 'light',
      waterConditions: 'clear',
      bestTimes: ['06:00 - 08:00', '18:00 - 20:00'],
      tips: [
        'Sabah erken saatlerde balık aktivitesi yüksek',
        'Hafif rüzgar balık avlamak için ideal',
        'Barometrik basınç stabil, balıklar aktif',
        'Su sıcaklığı balık türleri için uygun'
      ],
    },
  };

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setWeatherData(mockWeatherData);
    } catch (err) {
      console.error('Weather data loading error:', err);
      setError('Hava durumu verileri yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadWeatherData();
    setIsRefreshing(false);
  };

  const handleLocationPress = () => {
    Alert.alert(
      'Konum Değiştir',
      'Bu özellik yakında eklenecek!',
      [{ text: 'Tamam' }]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenContainer>
            <WeatherLoadingState />
          </ScreenContainer>
        </SafeAreaView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenContainer>
            <WeatherErrorState
              error={error}
              onRetry={fetchWeatherData}
            />
          </ScreenContainer>
        </SafeAreaView>
      </View>
    );
  }

  if (!weatherData) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenContainer>
            <WeatherErrorState
              error="Hava durumu verileri bulunamadı"
              onRetry={fetchWeatherData}
            />
          </ScreenContainer>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenContainer>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.locationContainer}>
                <Icon name="map-pin" size={20} color={theme.colors.primary} />
                <Text style={styles.locationText}>{location}</Text>
              </View>
              <Text style={styles.lastUpdated}>
                Son güncelleme: {new Date().toLocaleTimeString('tr-TR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>

            {/* Current Weather */}
            <CurrentWeatherCard 
              weatherData={weatherData}
              location={currentLocation}
              formattedTemperature={`${weatherData.current.temperature}°C`}
              formattedWindSpeed={`${weatherData.current.windSpeed} km/h`}
            />

            {/* Hourly Forecast */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Saatlik Tahmin</Text>
              <HourlyForecast data={weatherData.hourly} />
            </View>

            {/* Fishing Conditions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Balıkçılık Koşulları</Text>
              <FishingConditionsCard conditions={weatherData.fishingConditions} />
            </View>

            {/* Weather Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detaylar</Text>
              <WeatherDetailsGrid 
                humidity={weatherData.current.humidity}
                windSpeed={weatherData.current.windSpeed}
                windDirection={weatherData.current.windDirection}
                pressure={weatherData.current.pressure}
                visibility={weatherData.current.visibility}
                uvIndex={weatherData.current.uvIndex}
              />
            </View>

            {/* Daily Forecast */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7 Günlük Tahmin</Text>
              <View style={styles.dailyForecastContainer}>
                {weatherData.daily.map((day, index) => (
                  <DailyForecastCard
                    key={index}
                    date={day.date}
                    high={day.high}
                    low={day.low}
                    condition={day.condition}
                    icon={day.icon}
                    precipitation={day.precipitation}
                  />
                ))}
              </View>
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </ScreenContainer>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  locationText: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
  },
  lastUpdated: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  section: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  dailyForecastContainer: {
    gap: theme.spacing.sm,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});

export default WeatherScreen;