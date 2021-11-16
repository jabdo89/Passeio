import React, { useState, useEffect, useRef } from 'react';
import firebase from 'firebase';
import 'firebase/firestore';
import { StyleSheet, View, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import shortid from 'shortid';
import Carousel from 'react-native-snap-carousel';
import { StatusBar, setStatusBarNetworkActivityIndicatorVisible } from 'expo-status-bar';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import KeyboardAwareScroll from '@components/keyboard-aware-scroll';
import {
  Icon,
  Button,
  Spinner,
  Datepicker,
  List,
  Avatar,
  Card,
  Text,
  Tab,
  TabBar,
  Divider,
} from '@ui-kitten/components';
import {
  Container,
  Content,
  SigninButton,
  Question,
  TextSection,
  Message,
  Row,
  AvatarSection,
} from './elements';
import Header from './components/header';
import CarouselItem from './components/carousel-item';
import Map from './components/map';
import { Title } from '../send/elements';

const Deliver = () => {
  const ref = useRef();
  const mapRef = useRef({});
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

  const [services, setServices] = useState();

  const [selected, setSelected] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submittedTry, setSubmittedTry] = useState(false);

  useEffect(() => {
    setIsAddressError(form.destination.country !== form.startPoint.country);
  }, [form.destination, form.startPoint]);

  const next = async () => {
    if (isAddressError) {
      setSubmittedTry(true);
      return;
    }
    let temp = page;
    temp += 1;
    setPage(temp);
  };
  const back = async () => {
    setPage(0);
  };

  // List attributes
  const styles = StyleSheet.create({
    container: {
      maxHeight: 340,
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
        const info = [];
        let data = {};
        // eslint-disable-next-line func-names
        querySnapshot.forEach((doc) => {
          data = doc.data();
          if (data.driverID === '') {
            info.push(doc.data());
          }
        });
        setServices(info);
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

  //Get Country
  const getCountry = (data) => {
    for (let i = 0; i < data.address_components.length; i++) {
      if (data.address_components[i].types.includes('country')) {
        return data.address_components[i].long_name;
      }
    }
  };

  const filterAmazon = (data) => {
    const tempArray = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].type === 'Amazon') {
        tempArray.push(data[i]);
      }
    }
    return tempArray;
  };

  const submitLocal = async (id) => {
    setSubmitting(true);
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;
    db.collection('Services')
      .doc(id)
      .update({ driverID: user.uid, status: 'Chofer Encontrado' })
      .then(async (docRef) => {
        setSubmitting(false);
        setForm({
          startPoint: '',
          destination: '',
          size: '',
          date: new Date(),
        });
        setPage(0);
        Alert.alert('Entrega Confirmada', 'El cliente esta pagando su pedido', [
          { text: 'OK', onPress: () => navigate('ServiceList') },
        ]);
      });
  };

  const submitAmazon = async (id) => {
    setSubmitting(true);
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;
    db.collection('Services')
      .doc(id)
      .update({ driverID: user.uid, status: 'Chofer Encontrado' })
      .then(async (docRef) => {
        setSubmitting(false);
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
      <StatusBar style="auto" />
      <Header />
      <Divider />

      {page === 0 || page === 4 ? (
        <TabBar
          style={{ paddingTop: 20 }}
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
                    Dirrecion de Comienzo
                  </Text>
                  <GooglePlacesAutocomplete
                    ref={ref}
                    placeholder="Buscar dirrecion..."
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
                    Dirrecion de Destino
                  </Text>
                  <GooglePlacesAutocomplete
                    ref={ref}
                    placeholder="Buscar dirrecion..."
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
                  <Question style={{ marginTop: 20 }}> When are you planning to arrive? </Question>
                  <Datepicker
                    date={form.date}
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
                    Ver Entregas
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
              <Button appearance="ghost" onPress={() => back()}>
                Back, change info
              </Button>
            </Content>
          ) : null}
          {page === 1 ? (
            <Content>
              <View>
                <View>
                  {loading === false ? (
                    <Map ref={mapRef} services={services} center={center} form={form} />
                  ) : null}
                </View>
                {services ? (
                  <List
                    data={services}
                    style={styles.container}
                    renderItem={({ item }) => (
                      <Card
                        status="basic"
                        footer={(footerProps) => (
                          <Row {...footerProps}>
                            <Text style={{ left: 20 }}>
                              <Text style={{ fontWeight: 'bold' }}>Current Bid: </Text> $10.00
                            </Text>
                            <Button
                              onPress={() => goToPagareLocal(item)}
                              style={{ margin: 10, left: -30 }}
                              size="small"
                            >
                              Enviar
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
                            <Text>Cantidad : {item.quantity}</Text>
                            <Text>Descripcion :</Text>
                            <Text>Peso : {item.weight}</Text>
                          </View>
                        </Row>
                      </Card>
                    )}
                  />
                ) : null}
                <Button appearance="ghost" onPress={() => back()}>
                  Back, change info
                </Button>
              </View>
            </Content>
          ) : null}
          {page === -1 && selected !== null ? (
            <Content>
              <Text style={{ fontSize: 22, marginBottom: 10, fontWeight: 'bold' }}>
                Descripcion de Envio
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
                  <Text>Cantidad : {selected.quantity}</Text>
                  <Text>Descripcion :</Text>
                  <Text>Peso : {selected.weight}</Text>
                </View>
              </Row>
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
                <Text> Product Price: $ </Text>
                <Text style={{ marginBottom: 10 }}> Passeio Fee: $10.00</Text>
                <Divider />
                <Text style={{ marginTop: 10, fontWeight: '700' }}> Total: $60.00</Text>
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
                onPress={() => submitLocal(selected.id)}
              >
                Firmar Pagare
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
                    Pais de Destino
                  </Text>
                  <GooglePlacesAutocomplete
                    ref={ref}
                    placeholder="Buscar dirrecion..."
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
                    <Question> Cuando planeas llegar? </Question>
                    <Datepicker
                      date={form.date}
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
                      onPress={next}
                    >
                      Buscar Pedidos !
                    </SigninButton>
                  </View>
                </Content>
              </>
            ) : null}
            {page === 5 ? (
              <>
                <List
                  data={filterAmazon(services)}
                  style={{ height: '80%' }}
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

                          // onSnapToItem={setSelected}
                        />
                      )}
                      footer={(footerProps) => (
                        <Row {...footerProps}>
                          <Text style={{ left: 20, fontSize: 9 }}>
                            Recompensa : <Text style={{ fontWeight: 'bold' }}>$10.00</Text>
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
                      <Text style={{ fontWeight: '800' }}>Inversión: ${item.total}</Text>
                    </Card>
                  )}
                />
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
                  <Text> Product Price: ${selected.total} </Text>
                  <Text style={{ marginBottom: 10 }}> Passeio Fee: $10.00</Text>
                  <Divider />
                  <Text style={{ marginTop: 10, fontWeight: '700' }}> Total: $60.00</Text>
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
                  onPress={() => submitAmazon(selected.id)}
                >
                  Firmar Pagare
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
