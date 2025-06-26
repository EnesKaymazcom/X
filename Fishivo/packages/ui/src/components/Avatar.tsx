import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import DefaultAvatar from './DefaultAvatar';

interface AvatarProps {
  uri?: string | null;
  size?: number;
  style?: any;
  name?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = 40,
  style,
  name = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // URI kontrolü - null, undefined, boş string veya hata durumunda DefaultAvatar göster
  const shouldShowDefault = !uri ||
                           uri === null ||
                           uri === undefined ||
                           uri.trim() === '' ||
                           imageError;

  if (shouldShowDefault) {
    return (
      <DefaultAvatar
        size={size}
        name={name}
        style={style}
      />
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[
        styles.image,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style
      ]}
      onError={() => setImageError(true)}
      onLoadStart={() => setImageError(false)}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#f0f0f0',
  },
});

export default Avatar;