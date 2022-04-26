/* eslint-disable react/prop-types */
import React from 'react';
import { Text, Button } from '@ui-kitten/components';
import { View } from 'react-native';
import ExpoFastImage from 'expo-fast-image';

const CarouselItem = ({ item, navigation: { navigate }, type }) => {
  return (
    <Button
      appearance="ghost"
      onPress={() => {
        // eslint-disable-next-line no-unused-expressions
        type === 'Category'
          ? navigate('Send', { page: 3, type: 1, search: item.name, url: null })
          : navigate('Send', { page: 3, type: 1, search: null, url: item.url });
      }}
    >
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
        <Text style={{ margin: 10, fontWeight: '600' }}>{item.name}</Text>
      </View>
    </Button>
  );
};

export default CarouselItem;
