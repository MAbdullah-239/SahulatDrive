import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {Colors} from '../../../generalStyles/colors';

const OnBoarding = () => {
  return (
    <View style={styles.container}>
      <Text>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint deleniti
        reprehenderit fugiat, ullam nostrum veritatis quo placeat saepe qui,
        eaque similique fugit, tenetur quibusdam! Esse veniam quisquam adipisci
        iure harum?
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgColor,
  },
});

export default OnBoarding;
