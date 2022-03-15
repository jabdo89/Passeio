import React from 'react';
import { Text, Avatar, Button } from '@ui-kitten/components';
import { Image, StyleSheet, View } from 'react-native';
import { Card, Tag, TagsContainer, Icon, WithIcon } from './elements';

const CarouselItem = ({ item, index, theme, modal }) => {
  return (
    <Button appearance="ghost" onPress={() => modal(index)}>
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
            uri: item.imageUrl
              ? item.imageUrl
              : 'https://upload.wikimedia.org/wikipedia/commons/1/14/Product_sample_icon_picture.png',
          }}
        />
        {item.prices[0] === undefined ||
        item.weigth === undefined ||
        item.category === undefined ? (
          <Tag style={{ position: 'absolute' }}>
            <Text>Pendiente</Text>
          </Tag>
        ) : null}

        <Text style={{ margin: 10, fontWeight: '600' }}>
          $ {item.prices[0] && item.prices[0].price}
        </Text>
      </View>
    </Button>
  );
};

export default CarouselItem;
