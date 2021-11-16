import React from 'react';
import { Text, Avatar } from '@ui-kitten/components';
import { Image, StyleSheet, View } from 'react-native';
import { Card, Tag, TagsContainer, Icon, WithIcon } from './elements';

const CarouselItem = ({ item, theme }) => {
  return (
    <View style={{ height: 140, margin: 0, width: 200 }}>
      <Image
        style={{
          width: '100%',
          height: 100,
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
      <Text style={{ margin: 10, fontWeight: '600' }}>Productos 1</Text>
    </View>
  );
};

export default CarouselItem;
