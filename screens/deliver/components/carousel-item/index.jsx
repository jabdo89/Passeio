/* eslint-disable react/prop-types */
import React from 'react';
import { Image, View } from 'react-native';

const CarouselItem = ({ item }) => {
  return (
    <View style={{ height: 300, margin: 0, width: 200, marginLeft: 100 }}>
      <Image
        style={{
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: 10,
          height: 300,
          borderRadius: 20,
          marginVertical: -18,
          marginBottom: 0,
          top: 4,
          resizeMode: 'contain',
        }}
        source={{
          uri: item.imageUrl,
        }}
      />
    </View>
  );
};

export default CarouselItem;
