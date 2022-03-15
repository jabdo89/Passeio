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
          height: 130,
          borderRadius: 40,
          marginVertical: -18,
          marginBottom: 0,
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
