/* eslint-disable react/prop-types */
import React from 'react';
import { Image, View } from 'react-native';

const CarouselItem = ({ item }) => {
  return (
    <View style={{ height: 300, margin: 0, width: 200, marginLeft: 100 }}>
      <Image
        style={{
          width: '80%',
          marginTop: 5,
          height: 120,
          borderRadius: 20,
          marginVertical: -18,
          marginBottom: 0,
          top: 4,
          resizeMode: 'contain',
        }}
        source={{
          uri: item.imageUrl
            ? item.imageUrl
            : 'https://upload.wikimedia.org/wikipedia/commons/1/14/Product_sample_icon_picture.png',
        }}
      />
    </View>
  );
};

export default CarouselItem;
