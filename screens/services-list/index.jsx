import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Carousel from 'react-native-snap-carousel';
import { View, Image, Alert } from 'react-native';
import shortid from 'shortid';
import firebase from 'firebase';
import PropTypes from 'prop-types';
import { Text, Icon, List, Card, Modal, Divider, Tab, TabBar, Button } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Container, Title } from './elements';
import CarouselItem from './components/carousel-item';

// Uncomment for onPress functionality

const Done = () => {
  const { navigate } = useNavigation();
  const { top } = useSafeAreaInsets();
  const [exitModal, toggleExitModal] = useState({ status: false, value: null });
  const [services, setServices] = useState([]);
  const [servicesEntrega, setServicesEntrega] = useState([]);
  const [loading, setloading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const query = () => {
      const db = firebase.firestore();
      const user = firebase.auth().currentUser;
      setloading(true);
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
        setloading(false);
      });
    };
    query();
  }, []);

  const deleteService = (id) => {
    const db = firebase.firestore();

    db.collection('Services')
      .doc(id)
      .delete()
      .then(() => {
        Alert.alert('Tu servicio se ha borrado');
        toggleExitModal({ status: false, value: null });
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
        <Tab title="Pedidos" icon={EnviarIcon} />
        <Tab title="Viajes" icon={EntregarIcon} />
      </TabBar>
      {selectedIndex === 0 ? (
        <>
          {services.length === 0 && !loading && (
            <>
              <Text
                style={{
                  width: '60%',
                  textAlign: 'center',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  marginTop: '35%',
                }}
              >
                Aun no Tienes Pedidos
              </Text>
              <Text
                style={{
                  width: '60%',
                  textAlign: 'center',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                ¡Pide Tu Primer Producto!
              </Text>
              <Button
                style={{ width: '30%', marginRight: 'auto', marginLeft: 'auto', marginTop: 15 }}
                onPress={() => navigate('Send')}
              >
                Pedir
              </Button>
            </>
          )}
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
                        width: 120,
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
                            {moment(item.arrivalDate.seconds * 1000)
                              .locale('es')
                              .format('ddd, D MMM')}{' '}
                          </Text>
                          {item.status === 'Buscando Chofer' ? (
                            <Button
                              appearance="ghost"
                              onPress={() => toggleExitModal({ status: true, value: item.id })}
                            >
                              <Icon style={{ height: 20, width: 20 }} fill="red" name="trash-2" />
                            </Button>
                          ) : null}
                        </View>
                        <Text>
                          Paquetes : {item.products ? item.products.length : item.quantity}
                        </Text>
                        <Text>Ref : {item.id?.substring(0, 5)}</Text>
                        <Text>Total : ${item.total.total}</Text>
                        {item.status === 'Buscando Chofer' ? (
                          <Text
                            style={{
                              color: 'black',
                              fontWeight: '900',
                              margin: 0,
                              width: 140,
                              alignSelf: 'center',
                              textAlign: 'center',
                            }}
                          />
                        ) : null}
                        {item.status === 'Chofer Encontrado' ? (
                          <Button
                            style={{
                              width: 140,
                              height: 50,
                              marginLeft: 'auto',
                              marginRight: 'auto',
                              marginTop: 0,
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
                              marginTop: 0,
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
                            {moment(item.date.seconds * 1000)
                              .locale('es')
                              .format('ddd, D MMM')}{' '}
                          </Text>
                          {item.status === 'Buscando Chofer' ? (
                            <Button
                              appearance="ghost"
                              onPress={() => toggleExitModal({ status: true, value: item.id })}
                            >
                              <Icon style={{ height: 20, width: 20 }} fill="red" name="trash-2" />
                            </Button>
                          ) : null}
                        </View>
                        <Text>
                          Paquetes : {item.products ? item.products.length : item.quantity}
                        </Text>
                        <Text>Ref : {item.id?.substring(0, 5)}</Text>
                        <Text>Total : ${item.total.total}</Text>
                        {item.status === 'Buscando Chofer' ? (
                          <Text
                            style={{
                              color: 'black',
                              fontWeight: '700',

                              width: 160,
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
                              marginTop: 0,
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
          {servicesEntrega.length === 0 && !loading && (
            <>
              <Text
                style={{
                  width: '60%',
                  textAlign: 'center',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  marginTop: '35%',
                }}
              >
                Aun no Tienes Viajes
              </Text>
              <Text
                style={{
                  width: '60%',
                  textAlign: 'center',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                ¡Haz Tu Primer Viaje!
              </Text>
              <Button
                style={{ width: '30%', marginRight: 'auto', marginLeft: 'auto', marginTop: 15 }}
                onPress={() => navigate('Deliver')}
              >
                Viajar
              </Button>
            </>
          )}
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
                        width: 120,
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
                          {moment(item.arrivalDate.seconds * 1000)
                            .locale('es')
                            .format('ddd, D MMM')}{' '}
                        </Text>
                        <Text>Entregar a: {item.senderName.substring(0, 10)}</Text>
                        <Text>
                          Paquetes: {item.products ? item.products.length : item.quantity}
                        </Text>
                        <Text>Ref : {item.id?.substring(0, 5)}</Text>
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
                          {moment(item.date.seconds * 1000)
                            .locale('es')
                            .format('ddd, D MMM')}{' '}
                        </Text>
                        <Text>Entregar a: {item.senderName.substring(0, 10)}</Text>
                        <Text>
                          Paquetes : {item.products ? item.products.length : item.quantity}
                        </Text>
                        <Text>Ref : {item.id?.substring(0, 5)}</Text>
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
                              marginTop: 0,
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
      <Modal visible={exitModal.status}>
        <Card disabled>
          <Text>¿Estás seguro que deseas borrar el pedido?</Text>
          <Button
            style={{ marginTop: 10 }}
            status="danger"
            appearance="outline"
            onPress={() => deleteService(exitModal.value)}
          >
            Sí, borrar
          </Button>
          <Button
            style={{ marginTop: 10 }}
            onPress={() => toggleExitModal({ status: false, value: null })}
          >
            No, cancelar
          </Button>
        </Card>
      </Modal>
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
