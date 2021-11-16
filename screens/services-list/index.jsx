import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { View } from 'react-native';
import firebase from 'firebase';
import PropTypes from 'prop-types';
import { Text, Icon, List, ListItem, Divider, Tab, TabBar, Button } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Container, Tag, Title } from './elements';

// Uncomment for onPress functionality

const Done = () => {
  const { navigate } = useNavigation();
  const { top } = useSafeAreaInsets();
  const [services, setServices] = useState([]);
  const [servicesEntrega, setServicesEntrega] = useState([]);
  const [loading, setloading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const query = () => {
      const db = firebase.firestore();
      const user = firebase.auth().currentUser;
      db.collection('Services').onSnapshot((querySnapshot) => {
        const envios = [];
        const entregas = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userID === user.uid) {
            envios.push(doc.data());
          }
          if (data.driverID === user.uid) {
            entregas.push(doc.data());
          }
        });
        // info = info.slice().sort((a, b) => b.startDate - a.startDate);
        setServices(envios);
        setServicesEntrega(entregas);
        setloading(true);
      });
    };
    query();
  }, []);
  if (!loading) {
    return null;
  }

  // Tab Bar
  const EnviarIcon = (props) => <Icon {...props} name="arrowhead-up-outline" />;
  const EntregarIcon = (props) => <Icon {...props} name="car-outline" />;

  return (
    <Container pt={top}>
      <Title category="h5">Servicios Abiertos</Title>
      <Divider />
      <TabBar
        style={{ paddingTop: 20 }}
        selectedIndex={selectedIndex}
        onSelect={(index) => setSelectedIndex(index)}
      >
        <Tab title="Envios" icon={EnviarIcon} />
        <Tab title="Entregas" icon={EntregarIcon} />
      </TabBar>
      {selectedIndex === 0 ? (
        <>
          {services ? (
            <List
              data={services}
              style={{ maxHeight: '77%', backgroundColor: 'white' }}
              renderItem={({ item }) => (
                <View
                  style={{
                    width: '90%',
                    height: 220,
                    borderWidth: 0.2,
                    borderRadius: 20,
                    marginTop: 20,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                >
                  <View
                    style={{
                      width: '101%',
                      left: -1.5,
                      heigth: 100,
                      top: -1,
                      padding: 25,
                      backgroundColor: '#FFD700',
                      borderTopRightRadius: 20,
                      borderTopLeftRadius: 20,
                    }}
                  >
                    <Text style={{ fontWeight: '500' }}>
                      {item.destination.address} {item.type}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 10,
                    }}
                  >
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ marginLeft: 15 }}> ID. Viaje</Text>
                      <Text style={{ marginLeft: 18, fontWeight: '500' }}>
                        {item.id ? item.id.substring(0, 6) : ''}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text> Status</Text>
                      <Text style={{ fontWeight: '500' }}> {item.status}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ marginRight: 15 }}> Fecha</Text>
                      <Text style={{ marginRight: 15, fontWeight: '500' }}> Fecha</Text>
                    </View>
                  </View>
                  {item.status === 'Buscando Chofer' ? (
                    <Text
                      style={{
                        color: 'green',
                        fontWeight: '500',
                        margin: 10,
                        width: 220,
                        alignSelf: 'center',
                        textAlign: 'center',
                      }}
                    >
                      Esperando que un chofer acepte el pedido
                    </Text>
                  ) : null}
                  {item.status === 'Chofer Encontrado' ? (
                    <Button
                      style={{
                        width: 180,
                        height: 50,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        marginTop: 20,
                        borderRadius: 50,
                        backgroundColor: 'transparent',
                        borderColor: '#FFD700',
                      }}
                      onPress={() => navigate('Pay', { service: item, mode: 'TAKE' })}
                      size="small"
                    >
                      <Text style={{ color: 'black', fontWeight: '500', marginBottom: 10 }}>
                        Pagar
                      </Text>
                    </Button>
                  ) : null}
                  {item.status !== 'Chofer Encontrado' && item.status !== 'Buscando Chofer' ? (
                    <Button
                      style={{
                        width: 180,
                        height: 50,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        marginTop: 20,
                        borderRadius: 50,
                        backgroundColor: 'transparent',
                        borderColor: '#FFD700',
                      }}
                      size="small"
                      onPress={() => navigate('ServiceDetail', { service: item, mode: 'TAKE' })}
                    >
                      <Text style={{ color: 'black', fontWeight: '500', marginBottom: 10 }}>
                        Detalle
                      </Text>
                    </Button>
                  ) : null}
                </View>
              )}
            />
          ) : null}
        </>
      ) : (
        <>
          {servicesEntrega ? (
            <List
              data={servicesEntrega}
              style={{ maxHeight: '77%', backgroundColor: 'white' }}
              renderItem={({ item }) => (
                <View
                  style={{
                    width: '90%',
                    height: 220,
                    borderWidth: 0.2,
                    borderRadius: 20,
                    marginTop: 20,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                >
                  <View
                    style={{
                      width: '101%',
                      left: -1.5,
                      heigth: 100,
                      top: -1,
                      padding: 25,
                      backgroundColor: '#FFD700',
                      borderTopRightRadius: 20,
                      borderTopLeftRadius: 20,
                    }}
                  >
                    <Text style={{ fontWeight: '500' }}>{item.destination.address}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 10,
                    }}
                  >
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ marginLeft: 15 }}> ID. Viaje</Text>
                      <Text style={{ marginLeft: 18, fontWeight: '500' }}>
                        {item.id ? item.id.substring(0, 6) : ''}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text> Status</Text>
                      <Text style={{ fontWeight: '500' }}> {item.status}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ marginRight: 15 }}> Fecha</Text>
                      <Text style={{ marginRight: 15, fontWeight: '500' }}> Fecha</Text>
                    </View>
                  </View>
                  {item.status === 'Buscando Chofer' ? (
                    <Text
                      style={{
                        color: 'green',
                        fontWeight: '500',
                        margin: 10,
                        width: 220,
                        alignSelf: 'center',
                        textAlign: 'center',
                      }}
                    >
                      Esperando que un chofer acepte el pedido
                    </Text>
                  ) : null}
                  {item.status === 'Chofer Encontrado' ? (
                    <Button
                      style={{
                        width: 180,
                        height: 50,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        marginTop: 20,
                        borderRadius: 50,
                        backgroundColor: 'transparent',
                        borderColor: '#FFD700',
                      }}
                      size="small"
                    >
                      <Text style={{ color: 'black', fontWeight: '500', marginBottom: 10 }}>
                        Pagar
                      </Text>
                    </Button>
                  ) : null}
                  {item.status !== 'Chofer Encontrado' && item.status !== 'Buscando Chofer' ? (
                    <Button
                      style={{
                        width: 180,
                        height: 50,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        marginTop: 20,
                        borderRadius: 50,
                        backgroundColor: 'transparent',
                        borderColor: '#FFD700',
                      }}
                      size="small"
                    >
                      <Text style={{ color: 'black', fontWeight: '500', marginBottom: 10 }}>
                        Detalle
                      </Text>
                    </Button>
                  ) : null}
                </View>
              )}
            />
          ) : null}
        </>
      )}
    </Container>
  );
};

Done.defaultProps = {
  services: null,
};

Done.propTypes = {
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

export default Done;
