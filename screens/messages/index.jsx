import React, { useEffect, useState } from 'react';
import moment from 'moment';
import firebase from 'firebase';
import KeyboardAwareScroll from '@components/keyboard-aware-scroll';
import { Text, Divider, ListItem, List } from '@ui-kitten/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MessageModal from '../../templates/message-modal';
import { Container, Title } from './elements';

const Messages = () => {
  const { top } = useSafeAreaInsets();
  const [services, setServices] = useState([]);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const user = firebase.auth().currentUser;

  const select = (item) => {
    setSelected(item);
    setModal(true);
  };

  useEffect(() => {
    const query = () => {
      const db = firebase.firestore();
      db.collection('Services').onSnapshot((querySnapshot) => {
        const envios = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if ((data.userID === user.uid || data.driverID === user.uid) && data.payed) {
            envios.push(doc.data());
          }
        });
        // info = info.slice().sort((a, b) => b.startDate - a.startDate);
        setServices(envios);
      });
    };
    query();
  }, []);

  const renderItem = ({ item }) => (
    <ListItem
      onPress={() => select(item)}
      style={{ minHeight: 100 }}
      title={item.userID === user.uid ? item.driverName : item.senderName}
      description={item.lastMessage}
      accessoryRight={() => (
        <Text>
          {moment(item.lastMessageDate).format('ll') === 'Invalid date'
            ? null
            : moment(item.lastMessageDate).format('ll')}
        </Text>
      )}
    />
  );

  return (
    <Container pt={top}>
      <Title category="h5">Mensajes</Title>
      <Divider />
      <KeyboardAwareScroll>
        <List
          style={{
            maxHeight: '100%',
          }}
          data={services}
          renderItem={renderItem}
        />
        <MessageModal
          visible={modal}
          onClose={() => setModal(false)}
          onShow={() => setLoadingChat(true)}
          animationType="slide"
          chat={selected}
          loadingChat={loadingChat}
          setChat={setLoadingChat}
          setSelected={setSelected}
        />
      </KeyboardAwareScroll>
    </Container>
  );
};

export default Messages;
