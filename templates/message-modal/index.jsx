import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { View, Modal, ScrollView, FlatList } from 'react-native';
import KeyboardAwareScroll from '@components/keyboard-aware-scroll';
import {
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
  Icon,
  Button,
} from '@ui-kitten/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import firebase from 'firebase';
import uuid from 'react-native-uuid';
import Message from './components/message';
import {
  Container,
  MessagesContainer,
  Scroll,
  WhiteBox,
  SendButton,
  Form,
  Input,
} from './elements';

const TakePhotoModal = ({
  visible,
  onClose,
  onPhotoTaken,
  chat,
  loadingChat,
  setChat,
  setSelected,
  ...rest
}) => {
  const { top } = useSafeAreaInsets();
  const scroll = useRef();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const query = async () => {
      const user = firebase.auth().currentUser;
      setProfile(user);
      setMessages(null);
      const messagesRef = firebase.database().ref(`/messages/${chat.id}`).limitToLast(100);
      messagesRef.on('value', (snapshot) => {
        if (snapshot.empty) {
          setMessages(null);
        }
        const messagesObj = snapshot.val();
        let messagesArray = [];
        if (messagesObj !== null) {
          Object.keys(messagesObj).forEach((key) => messagesArray.push(messagesObj[key]));
          messagesArray = messagesArray.map((item) => {
            return {
              message: item.message,
              sender: item.sender,
              id: item.id,
              timestamp: item.timestamp,
            };
          });
          setMessages(messagesArray.reverse());
        }
      });
    };
    console.log('howdy');
    query();
  }, chat);

  const submit = async () => {
    console.log('hey');
    firebase.database().ref(`messages/${chat.id}`).push({
      id: uuid.v4(),
      message,
      timestamp: new Date().getTime(),
      sender: profile.uid,
    });
    setMessage('');
  };

  const SendIcon = (props) => <Icon {...props} name="navigation-2" />;

  console.log(loadingChat);

  const close = async () => {
    setMessages(null);
    setChat(false);
    setSelected(null);
    onClose();
  };

  const renderItem = ({ item }) => (
    <>
      <Message
        otherProfileImg={null}
        yourImage={null}
        key={item.id}
        message={item.message}
        sentAt={item.timestamp}
        seenAt={item.message}
        isYours={profile.uid === item.sender}
      />
      {console.log(profile.uid)}
      {console.log(item.sender)}
    </>
  );

  return (
    <Modal visible={visible} onRequestClose={onClose} {...rest}>
      <Container>
        <KeyboardAwareScroll>
          <FlatList data={messages} renderItem={renderItem} inverted style={{ marginTop: '25%' }} />

          <WhiteBox>
            <Form>
              <Input
                size="large"
                autoCapitalize="none"
                value={message}
                placeholder="Manda un Mensaje"
                onChangeText={(nextValue) => setMessage(nextValue)}
              />
              <SendButton
                autoCorrect={false}
                disabled={message === ''}
                onPress={submit}
                accessoryLeft={SendIcon}
              />
            </Form>
          </WhiteBox>
        </KeyboardAwareScroll>
        <Layout
          style={{
            paddingTop: top,
            position: 'absolute',
            width: '100%',
          }}
        >
          <TopNavigation
            alignment="left"
            title="Jorge Abdo"
            accessoryLeft={() => (
              <TopNavigationAction
                onPress={close}
                icon={(props) => <Icon {...props} name="arrow-back" />}
              />
            )}
            accessoryRight={() => (
              <TopNavigationAction icon={(props) => <Icon {...props} name="phone" />} />
            )}
          />
        </Layout>
      </Container>
    </Modal>
  );
};

TakePhotoModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPhotoTaken: PropTypes.func.isRequired,
};

export default TakePhotoModal;
