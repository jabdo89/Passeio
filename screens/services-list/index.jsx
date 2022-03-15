import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Carousel from 'react-native-snap-carousel';
import { View, Image, Alert } from 'react-native';
import shortid from 'shortid';
import firebase from 'firebase';
import PropTypes from 'prop-types';
import { Text, Icon, List, ListItem, Divider, Tab, TabBar, Button } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Container, Tag, Title } from './elements';
import CarouselItem from './components/carousel-item';

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
        let envios = [];
        let entregas = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status !== 'Completado') {
            if (data.userID === user.uid) {
              envios.push(doc.data());
            }
            if (data.driverID === user.uid) {
              entregas.push(doc.data());
            }
          }
        });
        envios = envios.slice().sort((a, b) => b.dateCreated.seconds - a.dateCreated.seconds);
        entregas = entregas.slice().sort((a, b) => b.dateCreated.seconds - a.dateCreated.seconds);
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

  const deleteService = (id) => {
    const db = firebase.firestore();

    db.collection('Services')
      .doc(id)
      .delete()
      .then(() => {
        Alert.alert('Tu servicio se ha borrado');
      })
      .catch((error) => {
        Alert.alert(error);
      });
  };

  // Tab Bar
  const EnviarIcon = (props) => <Icon {...props} name="arrowhead-up-outline" />;
  const EntregarIcon = (props) => <Icon {...props} name="car-outline" />;
  return (
    <Container pt={top}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title category="h5">Servicios Abiertos</Title>
        <Icon
          onPress={() => navigate('History')}
          style={{
            width: 32,
            height: 32,
            marginRight: 30,
          }}
          fill="#FFD700"
          name="book"
        />
      </View>
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
                    height: 240,
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
                      heigth: 10,
                      top: -1,
                      padding: 25,
                      backgroundColor: 'black',
                      borderTopRightRadius: 20,
                      borderTopLeftRadius: 20,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: '500',
                        color: '#FFD700',
                      }}
                    >
                      {item.type === 'Amazon' ? 'United States' : item.startPoint.country}
                    </Text>
                    {item.type === 'Amazon' ? (
                      <Icon
                        style={{
                          width: 32,
                          height: 32,
                        }}
                        fill="#FFD700"
                        name="globe-2"
                      />
                    ) : (
                      <Icon
                        style={{
                          width: 32,
                          height: 32,
                        }}
                        fill="#FFD700"
                        name="car"
                      />
                    )}
                    <Text
                      style={{
                        fontWeight: '500',
                        color: '#FFD700',
                      }}
                    >
                      {item.destination.country}
                    </Text>
                  </View>
                  {item.type === 'Amazon' ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                        height: 150,
                      }}
                    >
                      <View style={{ width: '40%', right: 100 }}>
                        <Carousel
                          data={item.products}
                          layout="tinder"
                          layoutCardOffset="0"
                          renderItem={(props) => (
                            <CarouselItem key={shortid.generate()} {...props} />
                          )}
                          sliderWidth={280}
                          itemWidth={200}
                          activeSlideAlignment="start"
                          inactiveSlideOpacity={0.9}
                          inactiveSlideScale={0.9}
                        />
                      </View>
                      <View style={{ marginRight: 20, marginTop: 5 }}>
                        <View
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontWeight: 'bold' }}>
                            {moment(item.dateCreated.seconds * 1000)
                              .locale('es')
                              .format('ddd, D MMM')}{' '}
                          </Text>
                          {item.status === 'Buscando Chofer' ? (
                            <Button appearance="ghost" onPress={() => deleteService(item.id)}>
                              <Icon style={{ height: 20, width: 20 }} fill="red" name="trash-2" />
                            </Button>
                          ) : null}
                        </View>
                        <Text>
                          Paquetes : {item.products ? item.products.length : item.quantity}
                        </Text>
                        <Text>Total : ${item.total.total}</Text>
                        {item.status === 'Buscando Chofer' ? (
                          <Text
                            style={{
                              color: 'black',
                              fontWeight: '900',
                              margin: 10,
                              width: 140,
                              alignSelf: 'center',
                              textAlign: 'center',
                            }}
                          >
                            Buscando Chofer
                          </Text>
                        ) : null}
                        {item.status === 'Chofer Encontrado' ? (
                          <Button
                            style={{
                              width: 140,
                              height: 50,
                              marginLeft: 'auto',
                              marginRight: 'auto',
                              marginTop: 20,
                              borderRadius: 50,
                              backgroundColor: '#FFD700',
                              borderColor: 'black',
                            }}
                            onPress={() => navigate('Pay', { service: item, mode: 'TAKE' })}
                            size="small"
                          >
                            <Text style={{ color: 'black', fontWeight: '900', marginBottom: 10 }}>
                              Pagar
                            </Text>
                          </Button>
                        ) : null}
                        {item.status !== 'Chofer Encontrado' &&
                        item.status !== 'Buscando Chofer' ? (
                          <Button
                            style={{
                              width: 140,
                              height: 50,
                              marginLeft: 'auto',
                              marginRight: 'auto',
                              marginTop: 20,
                              borderRadius: 50,
                              backgroundColor: 'transparent',
                              borderColor: '#FFD700',
                            }}
                            size="small"
                            onPress={() =>
                              navigate('ServiceDetail', { service: item, mode: 'TAKE' })
                            }
                          >
                            <Text style={{ color: 'black', fontWeight: '500', marginBottom: 10 }}>
                              Detalle
                            </Text>
                          </Button>
                        ) : null}
                      </View>
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                        height: 150,
                      }}
                    >
                      <View style={{ marginLeft: 30 }}>
                        <Image
                          style={{
                            width: 150,
                            height: 150,
                            marginRight: 10,
                            borderRadius: 20,
                            marginBottom: 0,
                          }}
                          source={{
                            uri: item.image,
                          }}
                        />
                      </View>
                      <View style={{ marginRight: 20, marginTop: 5 }}>
                        <View
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontWeight: 'bold' }}>
                            {moment(item.dateCreated.seconds * 1000)
                              .locale('es')
                              .format('ddd, D MMM')}{' '}
                          </Text>
                          {item.status === 'Buscando Chofer' ? (
                            <Button appearance="ghost" onPress={() => deleteService(item.id)}>
                              <Icon style={{ height: 20, width: 20 }} fill="red" name="trash-2" />
                            </Button>
                          ) : null}
                        </View>
                        <Text>
                          Paquetes : {item.products ? item.products.length : item.quantity}
                        </Text>
                        <Text>Total : ${item.total.total}</Text>
                        {item.status === 'Buscando Chofer' ? (
                          <Text
                            style={{
                              color: 'black',
                              fontWeight: '900',
                              margin: 10,
                              width: 140,
                              alignSelf: 'center',
                              textAlign: 'center',
                            }}
                          >
                            Buscando Chofer
                          </Text>
                        ) : null}
                        {item.status === 'Chofer Encontrado' ? (
                          <Button
                            style={{
                              width: 140,
                              height: 50,
                              marginLeft: 'auto',
                              marginRight: 'auto',
                              marginTop: 20,
                              borderRadius: 50,
                              backgroundColor: '#FFD700',
                              borderColor: 'black',
                            }}
                            onPress={() => navigate('Pay', { service: item, mode: 'TAKE' })}
                            size="small"
                          >
                            <Text style={{ color: 'black', fontWeight: '900', marginBottom: 10 }}>
                              Pagar
                            </Text>
                          </Button>
                        ) : null}
                        {item.status !== 'Chofer Encontrado' &&
                        item.status !== 'Buscando Chofer' ? (
                          <Button
                            style={{
                              width: 140,
                              height: 50,
                              marginLeft: 'auto',
                              marginRight: 'auto',
                              marginTop: 20,
                              borderRadius: 50,
                              backgroundColor: 'transparent',
                              borderColor: '#FFD700',
                            }}
                            size="small"
                            onPress={() =>
                              navigate('ServiceDetail', { service: item, mode: 'TAKE' })
                            }
                          >
                            <Text style={{ color: 'black', fontWeight: '500', marginBottom: 10 }}>
                              Detalle
                            </Text>
                          </Button>
                        ) : null}
                      </View>
                    </View>
                  )}
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
                    height: 240,
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
                      heigth: 10,
                      top: -1,
                      padding: 25,
                      backgroundColor: '#FFD700',
                      borderTopRightRadius: 20,
                      borderTopLeftRadius: 20,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: '500',
                      }}
                    >
                      {item.type === 'Amazon' ? 'United States' : item.startPoint.country}
                    </Text>
                    {item.type === 'Amazon' ? (
                      <Icon
                        style={{
                          width: 32,
                          height: 32,
                        }}
                        fill="black"
                        name="globe-2"
                      />
                    ) : (
                      <Icon
                        style={{
                          width: 32,
                          height: 32,
                        }}
                        fill="black"
                        name="car"
                      />
                    )}
                    <Text
                      style={{
                        fontWeight: '500',
                      }}
                    >
                      {item.destination.country}
                    </Text>
                  </View>
                  {item.type === 'Amazon' ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                        height: 150,
                      }}
                    >
                      <View style={{ width: '40%', right: 100 }}>
                        <Carousel
                          data={item.products}
                          layout="tinder"
                          layoutCardOffset="0"
                          renderItem={(props) => (
                            <CarouselItem key={shortid.generate()} {...props} />
                          )}
                          sliderWidth={280}
                          itemWidth={200}
                          activeSlideAlignment="start"
                          inactiveSlideOpacity={0.9}
                          inactiveSlideScale={0.9}
                        />
                      </View>
                      <View style={{ marginLeft: 10, marginTop: 5 }}>
                        <Text style={{ fontWeight: 'bold' }}>
                          {moment(item.dateCreated.seconds * 1000)
                            .locale('es')
                            .format('ddd, D MMM')}{' '}
                        </Text>
                        <Text>Entregar a: {item.senderName.substring(0, 10)}</Text>
                        <Text>
                          Paquetes: {item.products ? item.products.length : item.quantity}
                        </Text>

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
                          <Text
                            style={{
                              color: 'green',
                              fontWeight: '500',
                              margin: 10,
                              width: 150,
                              alignSelf: 'center',
                              textAlign: 'center',
                            }}
                          >
                            Esperando pago de cliente
                          </Text>
                        ) : null}
                        {item.status !== 'Chofer Encontrado' &&
                        item.status !== 'Buscando Chofer' ? (
                          <Button
                            style={{
                              width: 140,
                              height: 50,
                              marginLeft: 'auto',
                              marginRight: 'auto',
                              marginTop: 20,
                              borderRadius: 50,
                              backgroundColor: 'transparent',
                              borderColor: '#FFD700',
                            }}
                            size="small"
                            onPress={() =>
                              navigate('ServiceDetail', { service: item, mode: 'TAKE' })
                            }
                          >
                            <Text style={{ color: 'black', fontWeight: '500', marginBottom: 10 }}>
                              Detalle
                            </Text>
                          </Button>
                        ) : null}
                      </View>
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                        height: 150,
                      }}
                    >
                      <View style={{ marginLeft: 30 }}>
                        <Image
                          style={{
                            width: 150,
                            height: 150,
                            marginRight: 10,
                            borderRadius: 20,
                            marginBottom: 0,
                          }}
                          source={{
                            uri: item.image,
                          }}
                        />
                      </View>
                      <View style={{ marginRight: 20, marginTop: 5 }}>
                        <Text style={{ fontWeight: 'bold' }}>
                          {moment(item.dateCreated.seconds * 1000)
                            .locale('es')
                            .format('ddd, D MMM')}{' '}
                        </Text>
                        <Text>Entregar a: {item.senderName.substring(0, 10)}</Text>
                        <Text>
                          Paquetes : {item.products ? item.products.length : item.quantity}
                        </Text>
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
                          <Text
                            style={{
                              color: 'green',
                              fontWeight: '500',
                              marginTop: 10,
                              width: 150,
                              textAlign: 'center',
                            }}
                          >
                            Esperando que el cliente pague el pedido
                          </Text>
                        ) : null}
                        {item.status !== 'Chofer Encontrado' &&
                        item.status !== 'Buscando Chofer' ? (
                          <Button
                            style={{
                              width: 140,
                              height: 50,
                              marginLeft: 'auto',
                              marginRight: 'auto',
                              marginTop: 20,
                              borderRadius: 50,
                              backgroundColor: 'transparent',
                              borderColor: '#FFD700',
                            }}
                            size="small"
                            onPress={() =>
                              navigate('ServiceDetail', { service: item, mode: 'TAKE' })
                            }
                          >
                            <Text style={{ color: 'black', fontWeight: '500', marginBottom: 10 }}>
                              Detalle
                            </Text>
                          </Button>
                        ) : null}
                      </View>
                    </View>
                  )}
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