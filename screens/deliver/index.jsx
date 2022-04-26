/* eslint-disable no-plusplus */
import React, { useState, useEffect, useRef } from 'react';
import firebase from 'firebase';
import 'firebase/firestore';
import { StyleSheet, View, Alert, Image } from 'react-native';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import shortid from 'shortid';
import Carousel from 'react-native-snap-carousel';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import KeyboardAwareScroll from '@components/keyboard-aware-scroll';
import {
  Icon,
  Button,
  Spinner,
  Datepicker,
  List,
  Card,
  Text,
  Tab,
  TabBar,
  Divider,
} from '@ui-kitten/components';
import { useAuth } from '@providers/auth';
import { Container, Content, SigninButton, Question, Message, Row } from './elements';
import CarouselItem from './components/carousel-item';
import Map from './components/map';

const Deliver = () => {
  const ref = useRef();
  const mapRef = useRef({});
  const { user } = useAuth();
  const { top } = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    startPoint: '',
    destination: '',
    size: '',
    date: new Date(),
  });
  const [isAddressError, setIsAddressError] = useState(true);

  const [formInter, setFormInter] = useState({
    destination: '',
    date: new Date(),
  });

  const [page, setPage] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [servicesLocal, setServicesLocal] = useState();
  const [servicesLocalFiltered, setServicesLocalFiltered] = useState();
  const [services, setServices] = useState();
  const [servicesFiltered, setServicesFiltered] = useState();

  const [selected, setSelected] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submittedTry, setSubmittedTry] = useState(false);

  useEffect(() => {
    setIsAddressError(form.destination.country !== form.startPoint.country);
  }, [form.destination, form.startPoint]);

  function filterServicesLocal() {
    const temp = [];
    for (let i = 0; i < servicesLocal.length; i++) {
      if (servicesLocal[i].startPoint.country === form.startPoint.country) {
        temp.push(servicesLocal[i]);
      }
    }
    setServicesLocalFiltered(temp);
  }
  function filterServicesInternacional() {
    const temp = [];
    for (let i = 0; i < services.length; i++) {
      if (services[i].destination.country === formInter.destination.country) {
        temp.push(services[i]);
      }
    }
    setServicesFiltered(temp);
  }
  const next = async () => {
    if (isAddressError) {
      setSubmittedTry(true);
      return;
    }
    let temp = page;
    temp += 1;
    filterServicesLocal();
    filterServicesInternacional();
    setPage(temp);
  };

  const nextInter = async () => {
    let temp = page;
    temp += 1;
    filterServicesInternacional();
    setPage(temp);
  };
  const back = async () => {
    setPage(0);
  };
  const backInter = async () => {
    setPage(4);
  };

  // List attributes
  const styles = StyleSheet.create({
    container: {
      maxHeight: '60%',
    },
  });

  // Map Center
  const center = () => {
    const elements = [];

    elements.push(form.startPoint.address);
    elements.push(form.destination.address);

    mapRef.current.fitToSuppliedMarkers([...elements], {
      edgePadding: { top: 30, right: 30, bottom: 30, left: 30 },
      animated: true,
    });
  };

  const { navigate } = useNavigation();

  // Query

  useEffect(() => {
    const db = firebase.firestore();

    const query = async () => {
      db.collection('Services').onSnapshot((querySnapshot) => {
        const infoLocal = [];
        const infoInternacional = [];
        let data = {};
        // eslint-disable-next-line func-names
        querySnapshot.forEach((doc) => {
          data = doc.data();
          if (data.driverID === '') {
            if (data.type === 'Amazon') {
              infoInternacional.push(doc.data());
            } else {
              infoLocal.push(doc.data());
            }
          }
        });
        setServicesLocal(infoLocal);
        setServices(infoInternacional);
        setLoading(false);
      });
    };

    query();
  }, []);

  const CubeIcon = (props) => <Icon {...props} name="cube-outline" />;
  const GlobeIcon = (props) => <Icon {...props} name="globe-2-outline" />;

  const SetTab = async (index) => {
    if (index === 0) {
      setPage(0);
    } else {
      setPage(4);
    }
    setSelectedIndex(index);
  };

  // Get Country
  // eslint-disable-next-line consistent-return
  const getCountry = (data) => {
    for (let i = 0; i < data.address_components.length; i++) {
      if (data.address_components[i].types.includes('country')) {
        return data.address_components[i].long_name;
      }
    }
  };

  const submitLocal = async (selectedService) => {
    setSubmitting(true);
    const db = firebase.firestore();
    const fee = selectedService.total.total * 0.66;
    const newCredit = user.credit + fee;
    db.collection('Services')
      .doc(selectedService.id)
      .update({
        driverID: user.uid,
        status: 'Chofer Encontrado',
        driverName: `${user.firstName} ${user.lastName}`,
      })
      .then(async () => {
        setSubmitting(false);
        setForm({
          startPoint: '',
          destination: '',
          size: '',
          date: new Date(),
        });
        db.collection('Users').doc(user.uid).update({
          credit: newCredit,
        });
        setPage(0);
        Alert.alert('Entrega Confirmada', 'El cliente esta pagando su pedido', [
          { text: 'OK', onPress: () => navigate('ServiceList') },
        ]);
      });
  };

  const submitAmazon = async (selectedService) => {
    setSubmitting(true);
    const db = firebase.firestore();
    const fee = selectedService.total.delivery * 0.66;
    const newCredit = user.credit + fee;

    db.collection('Services')
      .doc(selectedService.id)
      .update({
        driverID: user.uid,
        status: 'Chofer Encontrado',
        driverName: `${user.firstName} ${user.lastName}`,
      })
      .then(async () => {
        setPage(0);
        setSubmitting(false);
        db.collection('Users').doc(user.uid).update({
          credit: newCredit,
        });
        Alert.alert('Entrega Confirmada', 'El cliente esta pagando su pedido', [
          { text: 'OK', onPress: () => navigate('ServiceList') },
        ]);
      });
  };

  const goToPagare = (data) => {
    setSelected(data);
    setPage(6);
  };

  const goToPagareLocal = (data) => {
    setSelected(data);
    setPage(-1);
  };

  const cancelPagare = () => {
    setSelected(null);
    setPage(5);
  };

  const cancelPagareLocal = () => {
    setSelected(null);
    setPage(1);
  };

  return (
    <>
      {page === 0 || page === 4 ? (
        <TabBar
          style={{ paddingTop: top }}
          selectedIndex={selectedIndex}
          onSelect={(index) => SetTab(index)}
        >
          <Tab title="Local" icon={CubeIcon} />
          <Tab title="Internacional" icon={GlobeIcon} />
        </TabBar>
      ) : null}
      {selectedIndex === 0 ? (
        <>
          {page === 0 ? (
            <KeyboardAwareScroll>
              <Container>
                <Content>
                  <Text
                    style={{
                      fontSize: 13,
                      marginBottom: 4,
                      fontWeight: 'bold',
                      color: '#8f9bb3',
                    }}
                  >
                    Dirección de Comienzo
                  </Text>
                  <GooglePlacesAutocomplete
                    ref={ref}
                    placeholder="Buscar dirección..."
                    listViewDisplayed={false}
                    fetchDetails
                    styles={{
                      textInput: {
                        backgroundColor: '#f7f9fc',
                        height: 50,
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: '#e4e9f2',
                        paddingVertical: 7,
                        paddingHorizontal: 8,
                        fontSize: 15,
                        flex: 1,
                      },
                    }}
                    onPress={(data, details) => {
                      ref.current?.setAddressText(data.description);
                      setForm({
                        ...form,
                        startPoint: {
                          address: data.description,
                          placeId: data.place_id,
                          location: details.geometry.location,
                          country: getCountry(details),
                        },
                      });
                    }}
                    query={{
                      key: 'AIzaSyCcdE49CrgHx3DZeqx3gmXg7VVwjrzNE7k',
                      language: 'en',
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      marginBottom: 4,
                      fontWeight: 'bold',
                      color: '#8f9bb3',
                    }}
                  >
                    Dirección de Destino
                  </Text>
                  <GooglePlacesAutocomplete
                    ref={ref}
                    placeholder="Buscar dirección..."
                    listViewDisplayed={false}
                    fetchDetails
                    styles={{
                      textInput: {
                        backgroundColor: '#f7f9fc',
                        height: 50,
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: '#e4e9f2',
                        paddingVertical: 7,
                        paddingHorizontal: 8,
                        fontSize: 15,
                        flex: 1,
                      },
                      loader: {
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        height: 5,
                      },
                    }}
                    onPress={(data, details) => {
                      ref.current?.setAddressText(data.description);
                      setForm({
                        ...form,
                        destination: {
                          address: data.description,
                          placeId: data.place_id,
                          location: details.geometry.location,
                          country: getCountry(details),
                        },
                      });
                    }}
                    query={{
                      key: 'AIzaSyCcdE49CrgHx3DZeqx3gmXg7VVwjrzNE7k',
                      language: 'en',
                    }}
                  />
                  <Question style={{ marginTop: 20 }}> ¿Cuándo planeas llegar? </Question>
                  <Datepicker
                    date={form.date}
                    filter={(date) => new Date() < date}
                    onSelect={(nextDate) => setForm({ ...form, date: nextDate })}
                  />
                  <SigninButton
                    style={{ marginTop: 100 }}
                    accessoryLeft={
                      submitting
                        ? (props) => (
                            <View {...props}>
                              <Spinner size="small" />
                            </View>
                          )
                        : undefined
                    }
                    disabled={submitting || form.destination === '' || form.startPoint === ''}
                    onPress={next}
                  >
                    ¡Buscar pedidos!
                  </SigninButton>
                  {isAddressError && submittedTry ? (
                    <Text
                      style={{
                        color: 'red',
                        textAlign: 'center',
                        width: 230,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                      }}
                    >
                      Las dirreciones tienen que estar en el mismo país
                    </Text>
                  ) : null}
                </Content>
              </Container>
            </KeyboardAwareScroll>
          ) : null}
          {page === 2 ? (
            <Content>
              <Message category="h5">
                Sit tight and relax! We will send you an email when we have confirmed if there is a
                MailMan for your package!
              </Message>
              <Button onPress={() => back()}>Back, change info</Button>
            </Content>
          ) : null}
          {page === 1 ? (
            <Content>
              <View>
                <View style={{ marginTop: top }}>
                  {loading === false ? (
                    <Map
                      ref={mapRef}
                      services={servicesLocalFiltered}
                      center={center}
                      form={form}
                    />
                  ) : null}
                </View>
                {servicesLocalFiltered.length === 0 ? (
                  <View
                    style={{
                      marginTop: 100,
                      marginBottom: 50,
                      width: '70%',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                  >
                    <Text style={{ fontSize: 15, textAlign: 'center' }}>
                      Por el momento no hay viajes para esta{' '}
                      <Text style={{ fontWeight: '700' }}>Ubicacion</Text>o{' '}
                      <Text style={{ fontWeight: '700' }}>Fecha</Text>.
                    </Text>
                  </View>
                ) : (
                  <List
                    data={servicesLocalFiltered}
                    style={styles.container}
                    renderItem={({ item, index }) => (
                      <Card
                        status="basic"
                        footer={(footerProps) => (
                          <Row {...footerProps}>
                            <Text style={{ left: 20, fontWeight: 'bold', fontSize: 16 }}>
                              Recompensa: ${parseFloat(item.total.total * 0.66).toFixed(2)}
                            </Text>
                            <Button
                              onPress={() => goToPagareLocal(item)}
                              style={{ margin: 10, left: -30, backgroundColor: '#28282B' }}
                            >
                              Entregar
                            </Button>
                          </Row>
                        )}
                      >
                        <Row style={{ justifyContent: 'flex-start' }}>
                          <Image
                            style={{
                              width: 100,
                              height: 120,
                              marginRight: 10,
                              borderRadius: 20,
                              marginBottom: 0,
                            }}
                            source={{
                              uri: item.image,
                            }}
                          />
                          <View>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                width: '70%',
                              }}
                            >
                              <Text style={{ width: 120, fontWeight: 'bold' }}>
                                {moment(item.date.seconds * 1000)
                                  .locale('es')
                                  .format('ddd, D MMM')}
                              </Text>
                              <View
                                style={{
                                  height: 40,
                                  width: 40,
                                  borderRadius: 20,
                                  backgroundColor: '#DBAF05',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Text style={{ fontSize: 14, color: 'white' }}>{index + 1}</Text>
                              </View>
                            </View>

                            <Text style={{ width: 200, fontWeight: 'bold' }}>
                              {item.startPoint.address.substring(0, 40)}
                            </Text>
                            <Text>Cantidad: {item.quantity}</Text>
                            <Text>Peso: {item.weight} libras</Text>
                          </View>
                        </Row>
                      </Card>
                    )}
                  />
                )}
                <Button appearance="ghost" onPress={() => back()}>
                  Buscar otro destino
                </Button>
              </View>
            </Content>
          ) : null}
          {page === -1 && selected !== null ? (
            <Content>
              <Text style={{ fontSize: 22, marginBottom: 10, fontWeight: 'bold', marginTop: top }}>
                Descripción de Envío
              </Text>
              <Divider />
              <Row style={{ justifyContent: 'flex-start', marginTop: 20, marginBottom: 20 }}>
                <Image
                  style={{
                    width: 100,
                    height: 120,
                    marginRight: 10,
                    borderRadius: 20,
                    marginBottom: 0,
                  }}
                  source={{
                    uri: selected.image,
                  }}
                />
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '70%',
                    }}
                  >
                    <Text style={{ width: 120, fontWeight: 'bold' }}>
                      {moment(selected.date.seconds * 1000)
                        .locale('es')
                        .format('ddd, D MMM')}
                    </Text>
                    <View
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 20,
                        backgroundColor: '#DBAF05',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 14, color: 'white' }}>1</Text>
                    </View>
                  </View>
                  <Text>Cantidad : {selected.quantity}</Text>
                  <Text>Peso : {selected.weight}</Text>
                </View>
              </Row>
              <Text style={{ width: '100%' }}>
                <Text style={{ fontWeight: 'bold' }}>Origen</Text> : {selected.startPoint.address}
              </Text>
              <Text style={{ width: '100%', marginTop: 20 }}>
                <Text style={{ fontWeight: 'bold' }}>Destino</Text> : {selected.destination.address}
              </Text>
              <View
                style={{
                  width: '90%',
                  heigth: 400,
                  borderRadius: 20,
                  borderColor: 'black',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  borderWidth: 0.5,
                  marginTop: 20,
                  padding: 20,
                }}
              >
                <Text style={{ marginTop: 0, fontWeight: '700' }}>
                  Recompensa: ${parseFloat(selected.total.total * 0.66).toFixed(2)}
                </Text>
              </View>

              <SigninButton
                style={{ width: '90%', marginLeft: 'auto', marginRight: 'auto' }}
                accessoryLeft={
                  submitting
                    ? (props) => (
                        <View {...props}>
                          <Spinner size="small" />
                        </View>
                      )
                    : undefined
                }
                onPress={() => submitLocal(selected)}
              >
                Entregar Productos
              </SigninButton>
              <Button appearance="ghost" onPress={cancelPagareLocal}>
                Cancelar
              </Button>
            </Content>
          ) : null}
        </>
      ) : (
        <>
          <Container>
            {page === 4 ? (
              <>
                <Content>
                  <Text
                    style={{
                      fontSize: 13,
                      marginBottom: 4,
                      fontWeight: 'bold',
                      color: '#8f9bb3',
                    }}
                  >
                    País de destino
                  </Text>
                  <GooglePlacesAutocomplete
                    ref={ref}
                    placeholder="Buscar dirección..."
                    listViewDisplayed={false}
                    fetchDetails
                    styles={{
                      textInput: {
                        backgroundColor: '#f7f9fc',
                        height: 50,
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: '#e4e9f2',
                        paddingVertical: 7,
                        paddingHorizontal: 8,
                        fontSize: 15,
                        flex: 1,
                      },
                    }}
                    onPress={(data, details) => {
                      ref.current?.setAddressText(data.description);
                      setFormInter({
                        ...formInter,
                        destination: {
                          address: data.description,
                          placeId: data.place_id,
                          location: details.geometry.location,
                          country: getCountry(details),
                        },
                      });
                    }}
                    query={{
                      key: 'AIzaSyCcdE49CrgHx3DZeqx3gmXg7VVwjrzNE7k',
                      language: 'en',
                    }}
                  />
                  <View style={{ top: -120, marginTop: 100 }}>
                    <Question> ¿Cuándo planeas llegar? </Question>
                    <Datepicker
                      date={formInter.date}
                      filter={(date) => new Date() < date}
                      onSelect={(nextDate) => setFormInter({ ...formInter, date: nextDate })}
                    />
                    <SigninButton
                      style={{
                        marginTop: 150,
                        width: 300,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                      }}
                      accessoryLeft={
                        submitting
                          ? (props) => (
                              <View {...props}>
                                <Spinner size="small" />
                              </View>
                            )
                          : undefined
                      }
                      disabled={formInter.destination === ''}
                      onPress={nextInter}
                    >
                      ¡Buscar pedidos!
                    </SigninButton>
                  </View>
                </Content>
              </>
            ) : null}
            {page === 5 ? (
              <>
                {servicesFiltered.length === 0 ? (
                  <View
                    style={{
                      marginTop: 100,
                      marginBottom: 50,
                      width: '70%',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                  >
                    <Text style={{ fontSize: 15, textAlign: 'center' }}>
                      Por el momento no hay viajes para esta
                      <Text style={{ fontWeight: '700' }}>Ubicacion</Text> o
                      <Text style={{ fontWeight: '700' }}>Fecha</Text>.
                    </Text>
                  </View>
                ) : (
                  <List
                    data={servicesFiltered}
                    style={{ height: '65%', marginBottom: 20 }}
                    renderItem={({ item }) => (
                      <Card
                        status="basic"
                        header={(headerProps) => (
                          <Carousel
                            {...headerProps}
                            data={item.products}
                            layout="tinder"
                            layoutCardOffset="0"
                            renderItem={(props) => (
                              <CarouselItem key={shortid.generate()} {...props} />
                            )}
                            sliderWidth={480}
                            itemWidth={200}
                            activeSlideAlignment="start"
                            inactiveSlideOpacity={0.9}
                            inactiveSlideScale={0.9}
                          />
                        )}
                        footer={(footerProps) => (
                          <Row {...footerProps}>
                            <Text style={{ left: 20, fontSize: 9 }}>
                              Recompensa :
                              <Text style={{ fontWeight: 'bold' }}>
                                ${parseFloat(item.total.delivery * 0.66).toFixed(2)}
                              </Text>
                            </Text>
                            <Button
                              onPress={() => goToPagare(item)}
                              style={{ margin: 10, left: -30 }}
                              size="small"
                            >
                              Entregar
                            </Button>
                          </Row>
                        )}
                      >
                        <Text>Cantidad de articulos: {item.products.length}</Text>
                        <Text>Entregar en: {item.destination.country}</Text>
                      </Card>
                    )}
                  />
                )}
                <Button onPress={backInter}>Buscar otro destino</Button>
              </>
            ) : null}
            {page === 6 && selected !== null ? (
              <Content>
                <View style={{ left: -30 }}>
                  <Carousel
                    data={selected.products}
                    renderItem={(props) => <CarouselItem key={shortid.generate()} {...props} />}
                    sliderWidth={480}
                    itemWidth={200}
                    activeSlideAlignment="start"
                    inactiveSlideOpacity={0.9}
                    inactiveSlideScale={0.9}

                    // onSnapToItem={setSelected}
                  />
                </View>
                <View
                  style={{
                    width: 350,
                    heigth: 400,
                    borderRadius: 20,
                    borderColor: 'black',
                    borderWidth: 0.5,
                    padding: 20,
                  }}
                >
                  <Text style={{ marginBottom: 10 }}>
                    Valor de Productos: ${selected.total.products}
                  </Text>

                  <Divider />
                  <Text style={{ marginTop: 10, fontWeight: '700' }}>
                    Recompensa: ${parseFloat(selected.total.delivery * 0.66).toFixed(2)}
                  </Text>
                </View>

                <SigninButton
                  accessoryLeft={
                    submitting
                      ? (props) => (
                          <View {...props}>
                            <Spinner size="small" />
                          </View>
                        )
                      : undefined
                  }
                  onPress={() => submitAmazon(selected)}
                >
                  Entregar Productos
                </SigninButton>
                <Button appearance="ghost" onPress={cancelPagare}>
                  Cancelar
                </Button>
              </Content>
            ) : null}
          </Container>
        </>
      )}
    </>
  );
};

export default Deliver;
