import React from 'react';
import { Text, Avatar } from '@ui-kitten/components';
import { Image, StyleSheet, View } from 'react-native';
import { Card, Tag, TagsContainer, Icon, WithIcon } from './elements';

const CarouselItem = ({ item, theme }) => {
  return (
    <View style={{ height: 300, margin: 0, width: 200, marginLeft: 100 }}>
      <Image
        style={{
          width: '100%',
          marginTop: 5,
          height: 120,
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
