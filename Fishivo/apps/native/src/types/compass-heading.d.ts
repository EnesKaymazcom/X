declare module 'react-native-compass-heading' {
  export interface CompassHeadingData {
    heading: number;
    accuracy: number;
  }

  export type CompassHeadingCallback = (data: CompassHeadingData) => void;

  const CompassHeading: {
    start: (degreeUpdateRate: number, callback: CompassHeadingCallback) => void;
    stop: () => void;
  };

  export default CompassHeading;
}