import {WIDTH_BASE_RATIO, HEIGHT_BASE_RATIO, FONT_SIZE} from '../utils/helpers';
import {Platform} from 'react-native';

import {Fonts} from './fontStyles';
import { Colors } from './colors';
const {StyleSheet} = require('react-native');

export const LayoutStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.White,
  },
  wrapperContainer: {flex: 1, backgroundColor: Colors.White},
  generalPaddingHorizontal: {
    paddingHorizontal: WIDTH_BASE_RATIO(16),
  },
  waves: {position: 'absolute', marginTop: HEIGHT_BASE_RATIO(48), zIndex: 0},
  userDetailsContainer: {
    position: 'absolute',
    marginTop:
      Platform.OS === 'ios' ? HEIGHT_BASE_RATIO(16) : HEIGHT_BASE_RATIO(10),
    marginLeft: WIDTH_BASE_RATIO(16),
    zIndex: 10,
    elevation: 10,
  },
  pfpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: WIDTH_BASE_RATIO(12),
    marginTop: HEIGHT_BASE_RATIO(8),
  },
  imageStyles: {width: 40, height: 40, borderRadius: 20},
  welcomeTxt: {
    ...Fonts.Urbanist_Medium_20_White,
    marginVertical: HEIGHT_BASE_RATIO(24),
  },
  initialsCircle: {
    width: WIDTH_BASE_RATIO(50),
    height: HEIGHT_BASE_RATIO(50),
    borderRadius: 25, // makes it a circle
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  initialsText: {
    color: 'white',
    fontSize: FONT_SIZE(16),
    fontWeight: 'bold',
  },
  totalSavings: {
    ...Fonts.Urbanist_Medium_20_White,
    marginTop: HEIGHT_BASE_RATIO(12),
  },
  balance: {
    ...Fonts.Urbanist_Bold_32_White,
    marginBottom: HEIGHT_BASE_RATIO(10),
  },
  linkBtn: {
    width: WIDTH_BASE_RATIO(191),
    height: HEIGHT_BASE_RATIO(51),
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.White,
  },
  withdrawBtn: {
    width: WIDTH_BASE_RATIO(191),
    height: HEIGHT_BASE_RATIO(51),
    borderRadius: 28,
    alignItems: 'center',
    paddingLeft: 8,
    backgroundColor: Colors.White,
    flexDirection: 'row',
    columnGap: WIDTH_BASE_RATIO(7),
  },
  bellButton: {
    position: 'absolute',
    right: WIDTH_BASE_RATIO(16),
    marginTop:
      Platform.OS === 'ios' ? HEIGHT_BASE_RATIO(33) : HEIGHT_BASE_RATIO(20),
    width: WIDTH_BASE_RATIO(40),
    height: HEIGHT_BASE_RATIO(40),
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  },
  fullScreenWrapper: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  fullScreenSafeArea: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  kycNavigatingContainer: {
    flex: 1,
    backgroundColor: Colors.White,
  },
});
