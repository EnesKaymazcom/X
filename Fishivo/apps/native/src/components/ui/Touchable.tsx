import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

export interface TouchableProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

const Touchable: React.FC<TouchableProps> = ({ children, ...props }) => {
  return (
    <TouchableOpacity {...props}>
      {children}
    </TouchableOpacity>
  );
};

export default Touchable;