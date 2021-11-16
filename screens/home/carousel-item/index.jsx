import React from 'react';
import { Text, Avatar } from '@ui-kitten/components';
import { Image, StyleSheet, View } from 'react-native';
import ExpoFastImage from 'expo-fast-image';
import { Card, Tag, TagsContainer, Icon, WithIcon } from './elements';

const CarouselItem = ({ item, theme, navigation: { navigate } }) => {
  return (
    <View style={{ height: 200, margin: 20, width: 200, backgroundColor: 'transparent' }}>
      <ExpoFastImage
        uri={item.imageUrl}
        cacheKey={item.id}
        style={{
          width: 200,
          height: 200,
          borderRadius: 20,
          backgroundColor: 'transparent',
          marginVertical: -18,
          marginBottom: 0,
          top: 4,
        }}
      />
      <Text style={{ margin: 10, fontWeight: '600' }}>Productos 1</Text>
    </View>
  );
};

export default CarouselItem;
