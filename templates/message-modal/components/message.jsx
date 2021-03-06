import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { View, Text } from 'react-native';
import { Bubble } from '../elements';

const Message = ({ otherProfileImg, isYours, message, sentAt, seenAt, yourImage }) => (
  <View
    style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: isYours ? 'flex-end' : 'flex-start',
      marginLeft: isYours ? 0 : 20,
      marginRight: isYours ? 20 : 0,
    }}
  >
    {/* {!isYours && <Avatar mt={5} mr={5} src={otherProfileImg || '/static/img/general/avatar.png'} />} */}
    <View style={{ display: 'flex', flexDirection: 'column' }}>
      <Bubble style={{ backgroundColor: isYours ? 'black' : '#FFD700' }}>
        <Text style={{ fontSize: 15, color: isYours ? 'white' : 'black' }}>{message}</Text>
      </Bubble>
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          display: 'flex',
          justifyContent: isYours ? 'flex-end' : 'flex-start',
        }}
      >
        <Text style={{ fontSize: 10, textAlign: isYours ? 'right' : 'left', color: 'lightGrey' }}>
          {moment(sentAt).format('h:mm a')}
        </Text>
        {/* {isYours && seenAt && (
          <Avatar ml={5} size={15} src={otherProfileImg || '/static/img/general/avatar.png'} />
        )} */}
      </View>
    </View>
    {/* {isYours && <Avatar mt={5} ml={5} src={yourImage || '/static/img/general/avatar.png'} />} */}
  </View>
);

Message.propTypes = {
  otherProfileImg: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  isYours: PropTypes.bool.isRequired,
  sentAt: PropTypes.any.isRequired,
  seenAt: PropTypes.any.isRequired,
  yourImage: PropTypes.string.isRequired,
};

export default Message;
