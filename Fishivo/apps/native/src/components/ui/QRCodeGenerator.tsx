import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  logo?: string;
  logoSize?: number;
  backgroundColor?: string;
  color?: string;
}

export interface QRCodeGeneratorRef {
  toDataURL: (callback: (data: string) => void) => void;
}

export const QRCodeGenerator = forwardRef<QRCodeGeneratorRef, QRCodeGeneratorProps>(
  ({ value, size = 250, logo, logoSize = 50, backgroundColor = 'white', color = 'black' }, ref) => {
    const qrRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      toDataURL: (callback: (data: string) => void) => {
        qrRef.current?.toDataURL(callback);
      }
    }));

    return (
      <View style={styles.container}>
        <QRCode
          value={value}
          size={size}
          color={color}
          backgroundColor={backgroundColor}
          logo={logo ? { uri: logo } : undefined}
          logoSize={logoSize}
          logoBackgroundColor="white"
          logoMargin={2}
          logoBorderRadius={25}
          getRef={(ref: any) => (qrRef.current = ref)}
        />
      </View>
    );
  }
);

QRCodeGenerator.displayName = 'QRCodeGenerator';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});