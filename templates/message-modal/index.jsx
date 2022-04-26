/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Modal, FlatList } from 'react-native';
import KeyboardAwareScroll from '@components/keyboard-aware-scroll';
import { Layout, TopNavigation, TopNavigationAction, Icon } from '@ui-kitten/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import firebase from 'firebase';
import uuid from 'react-native-uuid';
import Message from './components/message';
import { Container, WhiteBox, SendButton, Form, Input } from './elements';

const MessageModal = ({
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
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(null);
  const [profile, setProfile] = useState(null);
  const user = firebase.auth().currentUser;

  useEffect(() => {
    const query = async () => {
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
    query();
  }, chat);

  const submit = async () => {
    const db = firebase.firestore();

    firebase.database().ref(`messages/${chat.id}`).push({
      id: uuid.v4(),
      message,
      timestamp: new Date().getTime(),
      sender: profile.uid,
    });

    db.collection('Services')
      .doc(chat.id)
      .update({ lastMessage: message, lastMessageDate: new Date().getTime() });
    setMessage('');
  };

  const SendIcon = (props) => <Icon {...props} name="navigation-2" />;

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
            title={chat ? (chat.userID === user.uid ? chat.driverName : chat.senderName) : ''}
            accessoryLeft={() => (
              <TopNavigationAction
                onPress={close}
                icon={(props) => <Icon {...props} name="arrow-back" />}
              />
            )}
          />
        </Layout>
      </Container>
    </Modal>
  );
};

export default MessageModal;
