/* eslint-disable react/prop-types */
import React from 'react';
import moment from 'moment';
import { View, Text } from 'react-native';
import { Bubble } from '../elements';

const Message = ({ isYours, message, sentAt }) => (
  <View display="flex" justifyContent={isYours ? 'flex-end' : 'flex-start'}>
    <View style={{ display: 'flex', flexDirection: 'column' }}>
      <Bubble color={isYours ? 'primary' : 'secondary'}>
        <Text>{message}</Text>
      </Bubble>
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          display: 'flex',
          justifyContent: isYours ? 'flex-end' : 'flex-start',
        }}
      >
        <Text fontSize="0.6rem" textAlign={isYours ? 'right' : 'left'} color="lightGrey">
          {moment(sentAt).format('lll')}
        </Text>
      </View>
    </View>
  </View>
);

export default Message;
