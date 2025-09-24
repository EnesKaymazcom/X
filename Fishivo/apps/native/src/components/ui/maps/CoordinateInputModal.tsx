import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FishivoModal } from '@/components/ui/FishivoModal';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Theme } from '@/theme';
import { convert } from 'geo-coordinates-parser';

interface CoordinateInputModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (lat: number, lng: number) => void;
  currentCoordinates?: [number, number];
}

type CoordinateFormat = 'DD' | 'DMS' | 'DDM';

interface FormatTab {
  key: CoordinateFormat;
  label: string;
}

const CoordinateInputModal: React.FC<CoordinateInputModalProps> = ({
  visible,
  onClose,
  onNavigate,
  currentCoordinates,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  // State
  const [selectedFormat, setSelectedFormat] = useState<CoordinateFormat>('DD');
  
  // DD Format States
  const [ddLat, setDdLat] = useState<string>('');
  const [ddLng, setDdLng] = useState<string>('');
  const [ddLatDir, setDdLatDir] = useState<'N' | 'S'>('N');
  const [ddLngDir, setDdLngDir] = useState<'E' | 'W'>('E');
  
  // DMS Format States
  const [dmsLatDeg, setDmsLatDeg] = useState<string>('');
  const [dmsLatMin, setDmsLatMin] = useState<string>('');
  const [dmsLatSec, setDmsLatSec] = useState<string>('');
  const [dmsLatDir, setDmsLatDir] = useState<'N' | 'S'>('N');
  const [dmsLngDeg, setDmsLngDeg] = useState<string>('');
  const [dmsLngMin, setDmsLngMin] = useState<string>('');
  const [dmsLngSec, setDmsLngSec] = useState<string>('');
  const [dmsLngDir, setDmsLngDir] = useState<'E' | 'W'>('E');
  
  // DDM Format States
  const [ddmLatDeg, setDdmLatDeg] = useState<string>('');
  const [ddmLatMin, setDdmLatMin] = useState<string>('');
  const [ddmLatDir, setDdmLatDir] = useState<'N' | 'S'>('N');
  const [ddmLngDeg, setDdmLngDeg] = useState<string>('');
  const [ddmLngMin, setDdmLngMin] = useState<string>('');
  const [ddmLngDir, setDdmLngDir] = useState<'E' | 'W'>('E');

  const [isValid, setIsValid] = useState<boolean>(false);
  const [parsedCoordinate, setParsedCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // Error states
  const [latError, setLatError] = useState<string>('');
  const [lngError, setLngError] = useState<string>('');
  
  // DMS specific errors
  const [dmsLatDegError, setDmsLatDegError] = useState<string>('');
  const [dmsLatMinError, setDmsLatMinError] = useState<string>('');
  const [dmsLatSecError, setDmsLatSecError] = useState<string>('');
  const [dmsLngDegError, setDmsLngDegError] = useState<string>('');
  const [dmsLngMinError, setDmsLngMinError] = useState<string>('');
  const [dmsLngSecError, setDmsLngSecError] = useState<string>('');
  
  // DDM specific errors
  const [ddmLatDegError, setDdmLatDegError] = useState<string>('');
  const [ddmLatMinError, setDdmLatMinError] = useState<string>('');
  const [ddmLngDegError, setDdmLngDegError] = useState<string>('');
  const [ddmLngMinError, setDdmLngMinError] = useState<string>('');

  // Format tabs configuration
  const formatTabs: FormatTab[] = [
    { key: 'DD', label: 'DD' },
    { key: 'DMS', label: 'DMS' },
    { key: 'DDM', label: 'DDM' }
  ];

  // Initialize with current coordinates using geo-coordinates-parser
  useEffect(() => {
    if (visible && currentCoordinates) {
      const [lng, lat] = currentCoordinates;
      
      if (selectedFormat === 'DD') {
        setDdLat(Math.abs(lat).toFixed(6));
        setDdLng(Math.abs(lng).toFixed(6));
        setDdLatDir(lat >= 0 ? 'N' : 'S');
        setDdLngDir(lng >= 0 ? 'E' : 'W');
      } else {
        try {
          // Use geo-coordinates-parser for accurate conversion
          const coordString = `${lat}, ${lng}`;
          const converted = convert(coordString);
          
          if (selectedFormat === 'DMS') {
            // Convert to DMS format using library
            const dmsFormatted = converted.toCoordinateFormat((convert as any).to.DMS);
            // Parse the formatted string: "40° 26' 46.302" N, 79° 56' 55.903" W"
            const parts = dmsFormatted.split(', ');
            
            if (parts[0]) {
              const latParts = parts[0].match(/(\d+)°\s*(\d+)'\s*([\d.]+)"\s*([NS])/);
              if (latParts) {
                setDmsLatDeg(latParts[1]);
                setDmsLatMin(latParts[2]);
                setDmsLatSec(latParts[3]);
                setDmsLatDir(latParts[4] as 'N' | 'S');
              }
            }
            
            if (parts[1]) {
              const lngParts = parts[1].match(/(\d+)°\s*(\d+)'\s*([\d.]+)"\s*([EW])/);
              if (lngParts) {
                setDmsLngDeg(lngParts[1]);
                setDmsLngMin(lngParts[2]);
                setDmsLngSec(lngParts[3]);
                setDmsLngDir(lngParts[4] as 'E' | 'W');
              }
            }
          } else if (selectedFormat === 'DDM') {
            // Convert to DDM (DM) format using library
            const dmFormatted = converted.toCoordinateFormat((convert as any).to.DM);
            // Parse the formatted string: "40° 26.7717' N, 79° 56.93172' W"
            const parts = dmFormatted.split(', ');
            
            if (parts[0]) {
              const latParts = parts[0].match(/(\d+)°\s*([\d.]+)'\s*([NS])/);
              if (latParts) {
                setDdmLatDeg(latParts[1]);
                setDdmLatMin(latParts[2]);
                setDdmLatDir(latParts[3] as 'N' | 'S');
              }
            }
            
            if (parts[1]) {
              const lngParts = parts[1].match(/(\d+)°\s*([\d.]+)'\s*([EW])/);
              if (lngParts) {
                setDdmLngDeg(lngParts[1]);
                setDdmLngMin(lngParts[2]);
                setDdmLngDir(lngParts[3] as 'E' | 'W');
              }
            }
          }
        } catch (error) {
          // Fallback to manual calculation if parser fails
          const latAbs = Math.abs(lat);
          const lngAbs = Math.abs(lng);
          
          if (selectedFormat === 'DMS') {
            const latDeg = Math.floor(latAbs);
            const latMinFloat = (latAbs - latDeg) * 60;
            const latMin = Math.floor(latMinFloat);
            const latSec = (latMinFloat - latMin) * 60;
            
            setDmsLatDeg(latDeg.toString());
            setDmsLatMin(latMin.toString());
            setDmsLatSec(latSec.toFixed(3));
            setDmsLatDir(lat >= 0 ? 'N' : 'S');
            
            const lngDeg = Math.floor(lngAbs);
            const lngMinFloat = (lngAbs - lngDeg) * 60;
            const lngMin = Math.floor(lngMinFloat);
            const lngSec = (lngMinFloat - lngMin) * 60;
            
            setDmsLngDeg(lngDeg.toString());
            setDmsLngMin(lngMin.toString());
            setDmsLngSec(lngSec.toFixed(3));
            setDmsLngDir(lng >= 0 ? 'E' : 'W');
          } else if (selectedFormat === 'DDM') {
            const latDeg = Math.floor(latAbs);
            const latMin = (latAbs - latDeg) * 60;
            
            setDdmLatDeg(latDeg.toString());
            setDdmLatMin(latMin.toFixed(5));
            setDdmLatDir(lat >= 0 ? 'N' : 'S');
            
            const lngDeg = Math.floor(lngAbs);
            const lngMin = (lngAbs - lngDeg) * 60;
            
            setDdmLngDeg(lngDeg.toString());
            setDdmLngMin(lngMin.toFixed(5));
            setDdmLngDir(lng >= 0 ? 'E' : 'W');
          }
        }
      }
    }
  }, [visible, currentCoordinates, selectedFormat]);

  // Validate coordinates using geo-coordinates-parser
  useEffect(() => {
    let valid = false;
    let parsed: { latitude: number; longitude: number } | null = null;

    try {
      if (selectedFormat === 'DD') {
        if (ddLat && ddLng) {
          const lat = parseFloat(ddLat) * (ddLatDir === 'S' ? -1 : 1);
          const lng = parseFloat(ddLng) * (ddLngDir === 'W' ? -1 : 1);
          if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
            valid = true;
            parsed = { latitude: lat, longitude: lng };
          }
        }
      } else if (selectedFormat === 'DMS') {
        if (dmsLatDeg && dmsLatMin && dmsLatSec && dmsLngDeg && dmsLngMin && dmsLngSec) {
          // Build DMS string format that geo-coordinates-parser expects
          const dmsString = `${dmsLatDeg}° ${dmsLatMin}' ${dmsLatSec}" ${dmsLatDir}, ${dmsLngDeg}° ${dmsLngMin}' ${dmsLngSec}" ${dmsLngDir}`;
          try {
            const converted = convert(dmsString);
            valid = true;
            parsed = { 
              latitude: converted.decimalLatitude, 
              longitude: converted.decimalLongitude 
            };
          } catch {
            valid = false;
          }
        }
      } else if (selectedFormat === 'DDM') {
        if (ddmLatDeg && ddmLatMin && ddmLngDeg && ddmLngMin) {
          // Build DDM string format that geo-coordinates-parser expects
          const ddmString = `${ddmLatDeg}° ${ddmLatMin}' ${ddmLatDir}, ${ddmLngDeg}° ${ddmLngMin}' ${ddmLngDir}`;
          try {
            const converted = convert(ddmString);
            valid = true;
            parsed = { 
              latitude: converted.decimalLatitude, 
              longitude: converted.decimalLongitude 
            };
          } catch {
            valid = false;
          }
        }
      }
    } catch (e) {
      valid = false;
    }

    setIsValid(valid);
    setParsedCoordinate(parsed);
  }, [
    selectedFormat, 
    ddLat, ddLng, ddLatDir, ddLngDir,
    dmsLatDeg, dmsLatMin, dmsLatSec, dmsLatDir, dmsLngDeg, dmsLngMin, dmsLngSec, dmsLngDir,
    ddmLatDeg, ddmLatMin, ddmLatDir, ddmLngDeg, ddmLngMin, ddmLngDir
  ]);

  // Handle navigation
  const handleNavigate = () => {
    if (parsedCoordinate && isValid) {
      onNavigate(parsedCoordinate.latitude, parsedCoordinate.longitude);
      onClose();
    }
  };

  // Reset modal state when closed
  const handleClose = () => {
    setDdLat('');
    setDdLng('');
    setDmsLatDeg('');
    setDmsLatMin('');
    setDmsLatSec('');
    setDmsLngDeg('');
    setDmsLngMin('');
    setDmsLngSec('');
    setDdmLatDeg('');
    setDdmLatMin('');
    setDdmLngDeg('');
    setDdmLngMin('');
    setIsValid(false);
    setParsedCoordinate(null);
    onClose();
  };

  return (
    <FishivoModal
      visible={visible}
      onClose={handleClose}
      title={t('map.coordinates.enterCoordinateTitle')}
      showCloseButton={true}
      showDragIndicator={true}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Format Tabs */}
        <View style={styles.tabContainer}>
          {formatTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedFormat === tab.key && styles.tabActive
              ]}
              onPress={() => setSelectedFormat(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText,
                selectedFormat === tab.key && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          {selectedFormat === 'DD' && (
            <>
              {/* Latitude DD */}
              <View style={styles.coordinateGroup}>
                <Text style={styles.coordinateLabel}>{t('map.coordinates.latitude')}</Text>
                <View style={styles.ddInputRow}>
                  <TextInput
                    style={[styles.ddInput, latError ? styles.inputError : null]}
                    value={ddLat}
                    onChangeText={(text) => {
                      // Sadece sayı ve nokta kabul et
                      text = text.replace(/[^0-9.]/g, '');
                      
                      // Birden fazla nokta engelle
                      const dotCount = (text.match(/\./g) || []).length;
                      if (dotCount > 1) {
                        const firstDotIndex = text.indexOf('.');
                        text = text.substring(0, firstDotIndex + 1) + text.substring(firstDotIndex + 1).replace(/\./g, '');
                      }
                      
                      // Format kontrolü: max 2 digit + nokta + 6 decimal (latitude max 90)
                      if (text && text.includes('.')) {
                        const parts = text.split('.');
                        if (parts[0].length > 2) {
                          text = parts[0].substring(0, 2) + '.' + (parts[1] || '');
                        }
                        if (parts[1] && parts[1].length > 6) {
                          text = parts[0] + '.' + parts[1].substring(0, 6);
                        }
                      } else if (text && text.length > 2) {
                        text = text.substring(0, 2);
                      }
                      
                      setDdLat(text);
                      const num = parseFloat(text);
                      if (text && (isNaN(num) || num < 0 || num > 90)) {
                        setLatError(t('map.latitudeError'));
                      } else {
                        setLatError('');
                      }
                    }}
                    placeholder="40.734128"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text style={styles.degreeSymbol}>°</Text>
                  <TouchableOpacity 
                    style={styles.directionButton}
                    onPress={() => setDdLatDir(ddLatDir === 'N' ? 'S' : 'N')}
                  >
                    <Text style={styles.directionText}>{ddLatDir}</Text>
                  </TouchableOpacity>
                </View>
                {latError ? <Text style={styles.errorText}>{latError}</Text> : null}
              </View>

              {/* Longitude DD */}
              <View style={styles.coordinateGroup}>
                <Text style={styles.coordinateLabel}>{t('map.coordinates.longitude')}</Text>
                <View style={styles.ddInputRow}>
                  <TextInput
                    style={[styles.ddInput, lngError ? styles.inputError : null]}
                    value={ddLng}
                    onChangeText={(text) => {
                      // Sadece sayı ve nokta kabul et
                      text = text.replace(/[^0-9.]/g, '');
                      
                      // Birden fazla nokta engelle
                      const dotCount = (text.match(/\./g) || []).length;
                      if (dotCount > 1) {
                        const firstDotIndex = text.indexOf('.');
                        text = text.substring(0, firstDotIndex + 1) + text.substring(firstDotIndex + 1).replace(/\./g, '');
                      }
                      
                      // Format kontrolü: max 3 digit + nokta + 6 decimal (longitude max 180)
                      if (text && text.includes('.')) {
                        const parts = text.split('.');
                        if (parts[0].length > 3) {
                          text = parts[0].substring(0, 3) + '.' + (parts[1] || '');
                        }
                        if (parts[1] && parts[1].length > 6) {
                          text = parts[0] + '.' + parts[1].substring(0, 6);
                        }
                      } else if (text && text.length > 3) {
                        text = text.substring(0, 3);
                      }
                      
                      setDdLng(text);
                      const num = parseFloat(text);
                      if (text && (isNaN(num) || num < 0 || num > 180)) {
                        setLngError(t('map.longitudeError'));
                      } else {
                        setLngError('');
                      }
                    }}
                    placeholder="30.028023"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text style={styles.degreeSymbol}>°</Text>
                  <TouchableOpacity 
                    style={styles.directionButton}
                    onPress={() => setDdLngDir(ddLngDir === 'E' ? 'W' : 'E')}
                  >
                    <Text style={styles.directionText}>{ddLngDir}</Text>
                  </TouchableOpacity>
                </View>
                {lngError ? <Text style={styles.errorText}>{lngError}</Text> : null}
              </View>
            </>
          )}

          {selectedFormat === 'DMS' && (
            <>
              {/* Latitude DMS */}
              <View style={styles.coordinateGroup}>
                <Text style={styles.coordinateLabel}>{t('map.coordinates.latitude')}</Text>
                <View style={styles.dmsInputRow}>
                  <TextInput 
                    style={[styles.dmsInputDeg, dmsLatDegError ? styles.inputError : null]} 
                    value={dmsLatDeg}
                    onChangeText={(text) => {
                      setDmsLatDeg(text);
                      const num = parseInt(text);
                      if (text && (isNaN(num) || num < 0 || num > 90)) {
                        setDmsLatDegError(t('map.latitudeError'));
                      } else {
                        setDmsLatDegError('');
                      }
                    }}
                    placeholder="40" 
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.dmsSymbol}>°</Text>
                  <TextInput 
                    style={[styles.dmsInputMin, dmsLatMinError ? styles.inputError : null]} 
                    value={dmsLatMin}
                    onChangeText={(text) => {
                      // Sadece sayı ve nokta kabul et
                      text = text.replace(/[^0-9.]/g, '');
                      
                      // Birden fazla nokta engelle
                      const dotCount = (text.match(/\./g) || []).length;
                      if (dotCount > 1) {
                        const firstDotIndex = text.indexOf('.');
                        text = text.substring(0, firstDotIndex + 1) + text.substring(firstDotIndex + 1).replace(/\./g, '');
                      }
                      
                      // Format kontrolü: max 2 digit + nokta + 6 decimal
                      if (text && text.includes('.')) {
                        const parts = text.split('.');
                        if (parts[0].length > 2) {
                          text = parts[0].substring(0, 2) + '.' + (parts[1] || '');
                        }
                        if (parts[1] && parts[1].length > 6) {
                          text = parts[0] + '.' + parts[1].substring(0, 6);
                        }
                      } else if (text && text.length > 2) {
                        text = text.substring(0, 2);
                      }
                      
                      setDmsLatMin(text);
                      const num = parseFloat(text);
                      if (text && (isNaN(num) || num < 0 || num >= 60)) {
                        setDmsLatMinError(t('map.minuteError', { defaultValue: 'Minutes must be between 0-59.999999' }));
                      } else {
                        setDmsLatMinError('');
                      }
                    }}
                    placeholder="44.123456" 
                    keyboardType="numeric"
                  />
                  <Text style={styles.dmsSymbol}>'</Text>
                  <TextInput 
                    style={[styles.dmsInputSec, dmsLatSecError ? styles.inputError : null]} 
                    value={dmsLatSec}
                    onChangeText={(text) => {
                      // Sadece sayı ve nokta kabul et
                      text = text.replace(/[^0-9.]/g, '');
                      
                      // Birden fazla nokta engelle
                      const dotCount = (text.match(/\./g) || []).length;
                      if (dotCount > 1) {
                        const firstDotIndex = text.indexOf('.');
                        text = text.substring(0, firstDotIndex + 1) + text.substring(firstDotIndex + 1).replace(/\./g, '');
                      }
                      
                      // Format kontrolü: max 2 digit + nokta + 6 decimal
                      if (text && text.includes('.')) {
                        const parts = text.split('.');
                        if (parts[0].length > 2) {
                          text = parts[0].substring(0, 2) + '.' + (parts[1] || '');
                        }
                        if (parts[1] && parts[1].length > 6) {
                          text = parts[0] + '.' + parts[1].substring(0, 6);
                        }
                      } else if (text && text.length > 2) {
                        text = text.substring(0, 2);
                      }
                      
                      setDmsLatSec(text);
                      const num = parseFloat(text);
                      if (text && (isNaN(num) || num < 0 || num >= 60)) {
                        setDmsLatSecError(t('map.secondError', { defaultValue: 'Seconds must be between 0-59.999999' }));
                      } else {
                        setDmsLatSecError('');
                      }
                    }}
                    placeholder="2.861234" 
                    keyboardType="numeric"
                  />
                  <Text style={styles.dmsSymbol}>"</Text>
                  <TouchableOpacity 
                    style={styles.directionButton}
                    onPress={() => setDmsLatDir(dmsLatDir === 'N' ? 'S' : 'N')}
                  >
                    <Text style={styles.directionText}>{dmsLatDir}</Text>
                  </TouchableOpacity>
                </View>
                {(dmsLatDegError || dmsLatMinError || dmsLatSecError) ? (
                  <Text style={styles.errorText}>
                    {dmsLatDegError || dmsLatMinError || dmsLatSecError}
                  </Text>
                ) : null}
              </View>
              
              {/* Longitude DMS */}
              <View style={styles.coordinateGroup}>
                <Text style={styles.coordinateLabel}>{t('map.coordinates.longitude')}</Text>
                <View style={styles.dmsInputRow}>
                  <TextInput 
                    style={[styles.dmsInputDeg, dmsLngDegError ? styles.inputError : null]} 
                    value={dmsLngDeg}
                    onChangeText={(text) => {
                      setDmsLngDeg(text);
                      const num = parseInt(text);
                      if (text && (isNaN(num) || num < 0 || num > 180)) {
                        setDmsLngDegError(t('map.longitudeError'));
                      } else {
                        setDmsLngDegError('');
                      }
                    }}
                    placeholder="30" 
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <Text style={styles.dmsSymbol}>°</Text>
                  <TextInput 
                    style={[styles.dmsInputMin, dmsLngMinError ? styles.inputError : null]} 
                    value={dmsLngMin}
                    onChangeText={(text) => {
                      // Sadece sayı ve nokta kabul et
                      text = text.replace(/[^0-9.]/g, '');
                      
                      // Birden fazla nokta engelle
                      const dotCount = (text.match(/\./g) || []).length;
                      if (dotCount > 1) {
                        const firstDotIndex = text.indexOf('.');
                        text = text.substring(0, firstDotIndex + 1) + text.substring(firstDotIndex + 1).replace(/\./g, '');
                      }
                      
                      // Format kontrolü: max 2 digit + nokta + 6 decimal
                      if (text && text.includes('.')) {
                        const parts = text.split('.');
                        if (parts[0].length > 2) {
                          text = parts[0].substring(0, 2) + '.' + (parts[1] || '');
                        }
                        if (parts[1] && parts[1].length > 6) {
                          text = parts[0] + '.' + parts[1].substring(0, 6);
                        }
                      } else if (text && text.length > 2) {
                        text = text.substring(0, 2);
                      }
                      
                      setDmsLngMin(text);
                      const num = parseFloat(text);
                      if (text && (isNaN(num) || num < 0 || num >= 60)) {
                        setDmsLngMinError(t('map.minuteError', { defaultValue: 'Minutes must be between 0-59.999999' }));
                      } else {
                        setDmsLngMinError('');
                      }
                    }}
                    placeholder="1.234567" 
                    keyboardType="numeric"
                  />
                  <Text style={styles.dmsSymbol}>'</Text>
                  <TextInput 
                    style={[styles.dmsInputSec, dmsLngSecError ? styles.inputError : null]} 
                    value={dmsLngSec}
                    onChangeText={(text) => {
                      // Sadece sayı ve nokta kabul et
                      text = text.replace(/[^0-9.]/g, '');
                      
                      // Birden fazla nokta engelle
                      const dotCount = (text.match(/\./g) || []).length;
                      if (dotCount > 1) {
                        const firstDotIndex = text.indexOf('.');
                        text = text.substring(0, firstDotIndex + 1) + text.substring(firstDotIndex + 1).replace(/\./g, '');
                      }
                      
                      // Format kontrolü: max 2 digit + nokta + 6 decimal
                      if (text && text.includes('.')) {
                        const parts = text.split('.');
                        if (parts[0].length > 2) {
                          text = parts[0].substring(0, 2) + '.' + (parts[1] || '');
                        }
                        if (parts[1] && parts[1].length > 6) {
                          text = parts[0] + '.' + parts[1].substring(0, 6);
                        }
                      } else if (text && text.length > 2) {
                        text = text.substring(0, 2);
                      }
                      
                      setDmsLngSec(text);
                      const num = parseFloat(text);
                      if (text && (isNaN(num) || num < 0 || num >= 60)) {
                        setDmsLngSecError(t('map.secondError', { defaultValue: 'Seconds must be between 0-59.999999' }));
                      } else {
                        setDmsLngSecError('');
                      }
                    }}
                    placeholder="40.883456" 
                    keyboardType="numeric"
                  />
                  <Text style={styles.dmsSymbol}>"</Text>
                  <TouchableOpacity 
                    style={styles.directionButton}
                    onPress={() => setDmsLngDir(dmsLngDir === 'E' ? 'W' : 'E')}
                  >
                    <Text style={styles.directionText}>{dmsLngDir}</Text>
                  </TouchableOpacity>
                </View>
                {(dmsLngDegError || dmsLngMinError || dmsLngSecError) ? (
                  <Text style={styles.errorText}>
                    {dmsLngDegError || dmsLngMinError || dmsLngSecError}
                  </Text>
                ) : null}
              </View>
            </>
          )}

          {selectedFormat === 'DDM' && (
            <>
              {/* Latitude DDM */}
              <View style={styles.coordinateGroup}>
                <Text style={styles.coordinateLabel}>{t('map.coordinates.latitude')}</Text>
                <View style={styles.ddmInputRow}>
                  <TextInput 
                    style={[styles.ddmInputDeg, ddmLatDegError ? styles.inputError : null]} 
                    value={ddmLatDeg}
                    onChangeText={(text) => {
                      setDdmLatDeg(text);
                      const num = parseInt(text);
                      if (text && (isNaN(num) || num < 0 || num > 90)) {
                        setDdmLatDegError(t('map.latitudeError'));
                      } else {
                        setDdmLatDegError('');
                      }
                    }}
                    placeholder="40" 
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.dmsSymbol}>°</Text>
                  <TextInput 
                    style={[styles.ddmInputMinFull, ddmLatMinError ? styles.inputError : null]} 
                    value={ddmLatMin}
                    onChangeText={(text) => {
                      // Sadece sayı ve nokta kabul et
                      text = text.replace(/[^0-9.]/g, '');
                      
                      // Birden fazla nokta engelle
                      const dotCount = (text.match(/\./g) || []).length;
                      if (dotCount > 1) {
                        const firstDotIndex = text.indexOf('.');
                        text = text.substring(0, firstDotIndex + 1) + text.substring(firstDotIndex + 1).replace(/\./g, '');
                      }
                      
                      // Format kontrolü: max 2 digit + nokta + 6 decimal
                      if (text && text.includes('.')) {
                        const parts = text.split('.');
                        if (parts[0].length > 2) {
                          text = parts[0].substring(0, 2) + '.' + (parts[1] || '');
                        }
                        if (parts[1] && parts[1].length > 6) {
                          text = parts[0] + '.' + parts[1].substring(0, 6);
                        }
                      } else if (text && text.length > 2) {
                        text = text.substring(0, 2);
                      }
                      
                      setDdmLatMin(text);
                      const num = parseFloat(text);
                      if (text && (isNaN(num) || num < 0 || num >= 60)) {
                        setDdmLatMinError(t('map.minuteError', { defaultValue: 'Minutes must be between 0-59.999999' }));
                      } else {
                        setDdmLatMinError('');
                      }
                    }}
                    placeholder="44.047680" 
                    keyboardType="numeric"
                  />
                  <Text style={styles.dmsSymbol}>'</Text>
                  <TouchableOpacity 
                    style={styles.directionButton}
                    onPress={() => setDdmLatDir(ddmLatDir === 'N' ? 'S' : 'N')}
                  >
                    <Text style={styles.directionText}>{ddmLatDir}</Text>
                  </TouchableOpacity>
                </View>
                {(ddmLatDegError || ddmLatMinError) ? (
                  <Text style={styles.errorText}>
                    {ddmLatDegError || ddmLatMinError}
                  </Text>
                ) : null}
              </View>
              
              {/* Longitude DDM */}
              <View style={styles.coordinateGroup}>
                <Text style={styles.coordinateLabel}>{t('map.coordinates.longitude')}</Text>
                <View style={styles.ddmInputRow}>
                  <TextInput 
                    style={[styles.ddmInputDeg, ddmLngDegError ? styles.inputError : null]} 
                    value={ddmLngDeg}
                    onChangeText={(text) => {
                      setDdmLngDeg(text);
                      const num = parseInt(text);
                      if (text && (isNaN(num) || num < 0 || num > 180)) {
                        setDdmLngDegError(t('map.longitudeError'));
                      } else {
                        setDdmLngDegError('');
                      }
                    }}
                    placeholder="30" 
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <Text style={styles.dmsSymbol}>°</Text>
                  <TextInput 
                    style={[styles.ddmInputMinFull, ddmLngMinError ? styles.inputError : null]} 
                    value={ddmLngMin}
                    onChangeText={(text) => {
                      // Sadece sayı ve nokta kabul et
                      text = text.replace(/[^0-9.]/g, '');
                      
                      // Birden fazla nokta engelle
                      const dotCount = (text.match(/\./g) || []).length;
                      if (dotCount > 1) {
                        const firstDotIndex = text.indexOf('.');
                        text = text.substring(0, firstDotIndex + 1) + text.substring(firstDotIndex + 1).replace(/\./g, '');
                      }
                      
                      // Format kontrolü: max 2 digit + nokta + 6 decimal
                      if (text && text.includes('.')) {
                        const parts = text.split('.');
                        if (parts[0].length > 2) {
                          text = parts[0].substring(0, 2) + '.' + (parts[1] || '');
                        }
                        if (parts[1] && parts[1].length > 6) {
                          text = parts[0] + '.' + parts[1].substring(0, 6);
                        }
                      } else if (text && text.length > 2) {
                        text = text.substring(0, 2);
                      }
                      
                      setDdmLngMin(text);
                      const num = parseFloat(text);
                      if (text && (isNaN(num) || num < 0 || num >= 60)) {
                        setDdmLngMinError(t('map.minuteError', { defaultValue: 'Minutes must be between 0-59.999999' }));
                      } else {
                        setDdmLngMinError('');
                      }
                    }}
                    placeholder="1.681383" 
                    keyboardType="numeric"
                  />
                  <Text style={styles.dmsSymbol}>'</Text>
                  <TouchableOpacity 
                    style={styles.directionButton}
                    onPress={() => setDdmLngDir(ddmLngDir === 'E' ? 'W' : 'E')}
                  >
                    <Text style={styles.directionText}>{ddmLngDir}</Text>
                  </TouchableOpacity>
                </View>
                {(ddmLngDegError || ddmLngMinError) ? (
                  <Text style={styles.errorText}>
                    {ddmLngDegError || ddmLngMinError}
                  </Text>
                ) : null}
              </View>
            </>
          )}
        </View>

        {/* Navigate Button */}
        <TouchableOpacity 
          style={[styles.navigateButton, !isValid && styles.navigateButtonDisabled]}
          onPress={handleNavigate}
          disabled={!isValid}
        >
          <Text style={[styles.navigateButtonText, !isValid && styles.navigateButtonTextDisabled]}>
            {t('map.coordinates.ready')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </FishivoModal>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    maxHeight: 500,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 2,
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  inputSection: {
    gap: theme.spacing.xl,
  },
  coordinateGroup: {
    gap: theme.spacing.sm,
  },
  coordinateLabel: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  // DD Input Styles
  ddInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
  },
  ddInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  
  // DMS Input Styles
  dmsInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dmsInputDeg: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    textAlign: 'center',
    marginRight: 2,
  },
  dmsInputMin: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    textAlign: 'center',
    marginRight: 2,
  },
  dmsInputSec: {
    flex: 1.5,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    textAlign: 'center',
    marginRight: 2,
  },
  dmsSymbol: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    marginHorizontal: 2,
    paddingTop: 3, // Hafif yukarı hizalama
  },
  
  // DDM Input Styles
  ddmInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ddmInputDeg: {
    width: 50,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    textAlign: 'center',
    marginRight: 2,
  },
  ddmInputMin: {
    width: 100,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    textAlign: 'center',
    marginRight: 2,
  },
  ddmInputMinFull: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    textAlign: 'center',
    marginRight: 2,
  },
  
  degreeSymbol: {
    fontSize: theme.typography.lg,
    color: theme.colors.textSecondary,
    marginHorizontal: 2,
    paddingTop: 3, // Hafif yukarı hizalama
  },
  
  directionButton: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  directionText: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
  },
  
  navigateButton: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  navigateButtonDisabled: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  navigateButtonText: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: '#FFFFFF',
  },
  navigateButtonTextDisabled: {
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: theme.typography.xs,
    color: theme.colors.error || '#FF0000',
    marginTop: 4,
    marginLeft: theme.spacing.xs,
  },
  inputError: {
    borderColor: theme.colors.error || '#FF0000',
    borderWidth: 1.5,
  },
});

export default CoordinateInputModal;