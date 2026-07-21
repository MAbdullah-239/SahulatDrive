import {Dimensions} from 'react-native';

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;

// Width based ratio
export const WIDTH_BASE_RATIO = (value: number): number => {
  const DESIGN_WIDTH = 430;
  return (DEVICE_WIDTH * value) / DESIGN_WIDTH;
};

// Height based ratio
export const HEIGHT_BASE_RATIO = (value: number): number => {
  const DESIGN_HEIGHT = 932;
  return (DEVICE_HEIGHT * value) / DESIGN_HEIGHT;
};

// Font size scaling
export const FONT_SIZE = (value: number): number => {
  return HEIGHT_BASE_RATIO(value);
};
export const formatTimer = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
