import {
  Dimensions,
} from 'react-native';

const {
  width,
  height,
} = Dimensions.get('window');

export const SCREEN_WIDTH =
  width;

export const SCREEN_HEIGHT =
  height;

export const wp = (percent) =>
  (width * percent) / 100;

export const hp = (percent) =>
  (height * percent) / 100;