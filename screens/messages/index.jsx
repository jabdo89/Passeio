import React, { useEffect, useState, useRef } from 'react';
import moment from 'moment';
import firebase from 'firebase';
import uuid from 'react-native-uuid';
import KeyboardAwareScroll from '@components/keyboard-aware-scroll';
import PropTypes from 'prop-types';
import { ScrollView } from 'react-native';
import { Text, Icon, Divider, ListItem, List } from '@ui-kitten/components';
import MessageModal from '../../templates/message-modal';
import Message from './components/message';
// import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Container,
  Title,
  WhiteBox,
  SendButton,
  MessagesContainer,
  Scroll,
  Form,
  Subtitle,
  Input,
} from './elements';

const Messages = () => {
  const { top } = useSafeAreaInsets();
  const [services, setServices] = useState([]);
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState(null);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loadingChat, setLoadingChat] = useState(false);

  const SendIcon = (props) => <Icon {...props} name="navigation-2" />;

  const select = (item) => {
    setSelected(item);
    setModal(true);
  };

  useEffect(() => {
    const query = () => {
      const db = firebase.firestore();
      const user = firebase.auth().currentUser;
      setProfile(user);
      db.collection('Services').onSnapshot((querySnapshot) => {
        const envios = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userID === user.uid || data.driverID === user.uid) {
            envios.push(doc.data());
          }
        });
        // info = info.slice().sort((a, b) => b.startDate - a.startDate);
        setServices(envios);
      });
    };
    query();
  }, []);

  const envio = (props) => <Text> Envio</Text>;
  const entrega = (props) => <Text> Entrega</Text>;

  const renderItem = ({ item, index }) => (
    <ListItem
      onPress={() => select(item)}
      style={{ minHeight: 100 }}
      title={`Servicio:  ${item.id.substring(0, 7)}`}
      description={`${item.description} ${index + 1}`}
      accessoryRight={item.userID === profile.uid ? envio : entrega}
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

Messages.defaultProps = {
  services: null,
};

Messages.propTypes = {
  services: PropTypes.arrayOf(
    PropTypes.shape({
      declaredValue: PropTypes.number,
      hub: PropTypes.string,
      startTime: PropTypes.any,
      startDate: PropTypes.any,
      deliveries: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          email: PropTypes.string,
          phone: PropTypes.string,
          address: PropTypes.string,
          comments: PropTypes.string,
        })
      ),
    })
  ),
};

export default Messages;
