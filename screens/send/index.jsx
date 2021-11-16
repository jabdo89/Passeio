import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import KeyboardAwareScroll from '@components/keyboard-aware-scroll';
import firebase from 'firebase';
import CreditCard from 'react-native-credit-card-v2';
import { useNavigation } from '@react-navigation/native';
import shortid from 'shortid';
import 'firebase/functions';
import TakePhotoModal from '../../templates/take-photo-modal';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import {
  Icon,
  Button,
  Spinner,
  Datepicker,
  Tab,
  TabBar,
  Divider,
  List,
  Avatar,
  Card,
  useTheme,
} from '@ui-kitten/components';
import Carousel from 'react-native-snap-carousel';
import Header from './components/header';
import CarouselItem from './components/carousel-item';
import {
  Container,
  Content,
  Input,
  SigninButton,
  Question,
  Price,
  Message,
  Row,
  TextSection,
  AvatarSection,
  Subtitle,
} from './elements';

const Send = () => {
  const ref = useRef();
  const theme = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [form, setForm] = useState({
    startPoint: '',
    destination: '',
    size: '',
    value: '',
    weight: '',
    quantity: '',
    image: '',
    date: new Date(),
  });
  const [creditCard, setCreditCard] = useState({
    number: '',
    cvc: '',
    expiry: '',
    type: '',
    name: '',
  });

  const [amazon, setAmazon] = useState({
    search: '',
  });

  const [amazonResult, setAmazonResult] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);

  const [page, setPage] = useState(0);

  // Form Conditionals
  const [submittedTry, setSubmittedTry] = useState(false);
  const [isEmailError, setIsEmailError] = useState(true);
  const [isAddressError, setIsAddressError] = useState(true);
  const [isValueError, setIsValueError] = useState(true);
  const [isWeightError, setIsWeightError] = useState(true);
  const [isQuantityError, setIsQuantityError] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [isTakePhotoModalOpen, toggleTakePhotoModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    setIsAddressError(form.destination.country !== form.startPoint.country);
  }, [form.destination, form.startPoint]);

  useEffect(() => {
    setIsValueError(form.value <= 0);
  }, [form.value]);

  useEffect(() => {
    setIsWeightError(form.weight <= 0);
  }, [form.weight]);

  useEffect(() => {
    setIsQuantityError(form.quantity <= 0);
  }, [form.quantity]);

  const next = async () => {
    if (isAddressError || isValueError || isWeightError || isQuantityError) {
      setSubmittedTry(true);
      return;
    }
    setPage(1);
  };

  const back = async () => {
    setPage(0);
  };

  const savePhoto = async ({ imageBlob }) => {
    // Do not request access because this relies on the driver already gave access
    // in the Home screen
    const imgRef = firebase.storage().ref().child(`service-images/${shortid.generate()}`);
    setUploadingImage(true);
    const task = imgRef.put(imageBlob);
    task.on(
      'state_changed',
      () => {},
      () => {},
      () => {
        imgRef.getDownloadURL().then((url) => {
          setForm({ ...form, image: url });
        });
      }
    );
  };

  const { navigate } = useNavigation();

  const submit = async () => {
    setSubmitting(true);
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;
    db.collection('Services')
      .add({
        ...form,
        dateCreated: new Date(),
        status: 'posted',
        userID: user.uid,
        driverID: '',
        type: 'Local',
      })
      .then(async (docRef) => {
        db.collection('Services').doc(docRef.id).update({ id: docRef.id });
        setSubmitting(false);
        setForm({
          startPoint: '',
          destination: '',
          size: '',
          value: '',
          weight: '',
          quantity: '',
          image: '',
          date: new Date(),
        });
        setPage(0);
        Alert.alert('Pedido Confirmado', 'Buscando Chofer', [
          { text: 'OK', onPress: () => navigate('ServiceList') },
        ]);
      });
  };

  // Amazon API
  const amazonSearch = async () => {
    const functions = firebase.functions();
    setPage(4);
    functions
      .httpsCallable('listProducts')(amazon.search)
      .then((response) => {
        setAmazonResult(response.data);
      });
  };

  const backAmazon = async () => {
    setPage(3);
    setAmazonResult(null);
  };

  const [amazonDestination, setAmazonDestination] = useState('');

  const submitAmazon = async () => {
    setSubmitting(true);
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;
    db.collection('Services')
      .add({
        destination: amazonDestination,
        dateCreated: new Date(),
        status: 'Buscando Chofer',
        type: 'Amazon',
        total: 60.0,
        payed: false,
        products: cart,
        userID: user.uid,
        driverID: '',
      })
      .then(async (docRef) => {
        db.collection('Services').doc(docRef.id).update({ id: docRef.id });
        setSubmitting(false);
        Alert.alert('Pedido Confirmado', 'Buscando Chofer', [
          { text: 'OK', onPress: () => navigate('ServiceList') },
        ]);
      });
  };

  // List attributes
  const styles = StyleSheet.create({
    container: {
      maxHeight: 520,
    },
  });

  // Tab Bar
  const CubeIcon = (props) => <Icon {...props} name="cube-outline" />;
  const GlobeIcon = (props) => <Icon {...props} name="globe-2-outline" />;

  const SetTab = async (index) => {
    if (index === 0) {
      setPage(0);
    } else {
      setPage(3);
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

  const addToCart = (data) => {
    setSelectedProduct(data);
    const temp = cart;
    temp.push(data);
    setCart(temp);
  };
  return (
    <>
      <StatusBar style="auto" />
      <Header />
      <Divider />
      <TabBar
        style={{ paddingTop: 20 }}
        selectedIndex={selectedIndex}
        onSelect={(index) => SetTab(index)}
      >
        <Tab title="Local" icon={CubeIcon} />
        <Tab title="Amazon" icon={GlobeIcon} />
      </TabBar>
      <KeyboardAwareScroll>
        <Container>
          {selectedIndex === 0 ? (
            <>
              {page === 0 ? (
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
                        marginBottom: 20,
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
                  <Input
                    size="large"
                    autoCapitalize="none"
                    value={form.value}
                    label="Valor"
                    keyboardType="numeric"
                    placeholder="Cual es el precio del producto?"
                    caption={submittedTry && isValueError && 'Ingresa un valor valido'}
                    captionIcon={(props) =>
                      submittedTry &&
                      isValueError && <Icon {...props} name="alert-circle-outline" />
                    }
                    status={submittedTry && isValueError && 'warning'}
                    accessoryLeft={(props) => <Icon {...props} name="pricetags-outline" />}
                    onChangeText={(nextValue) => setForm({ ...form, value: nextValue })}
                  />
                  <Row>
                    <Input
                      style={{ width: '45%' }}
                      size="large"
                      autoCapitalize="none"
                      value={form.weight}
                      keyboardType="numeric"
                      label="Peso"
                      placeholder="Cual es el peso del paquete?"
                      caption={submittedTry && isWeightError && 'Ingresa un Peso valido'}
                      captionIcon={(props) =>
                        submittedTry &&
                        isWeightError && <Icon {...props} name="alert-circle-outline" />
                      }
                      status={submittedTry && isWeightError && 'warning'}
                      accessoryLeft={(props) => <Icon {...props} name="layers-outline" />}
                      onChangeText={(nextValue) => setForm({ ...form, weight: nextValue })}
                    />
                    <Input
                      size="large"
                      style={{ width: '45%' }}
                      autoCapitalize="none"
                      value={form.quantity}
                      label="# Articulos"
                      keyboardType="numeric"
                      placeholder="Cuantos articulos esta mandando?"
                      caption={
                        submittedTry &&
                        isQuantityError &&
                        'Ingresa una cantidad de articulos valida'
                      }
                      captionIcon={(props) =>
                        submittedTry &&
                        isQuantityError && <Icon {...props} name="alert-circle-outline" />
                      }
                      status={submittedTry && isQuantityError && 'warning'}
                      accessoryLeft={(props) => <Icon {...props} name="hash-outline" />}
                      onChangeText={(nextValue) => setForm({ ...form, quantity: nextValue })}
                    />
                  </Row>
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
                    disabled={submitting || form.destination === '' || form.startPoint === ''}
                    onPress={next}
                  >
                    Siguiente Paso!
                  </SigninButton>
                  {isAddressError ? (
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
              ) : null}

              {page === 1 ? (
                <Content>
                  <Question> When do you want your package by? </Question>
                  <Datepicker
                    date={form.date}
                    onSelect={(nextDate) => setForm({ ...form, date: nextDate })}
                  />
                  <Row>
                    <Button
                      onPress={() => toggleTakePhotoModal(true)}
                      style={{
                        borderRadius: 30,
                        width: 140,
                        marginTop: 20,
                        height: 70,
                      }}
                    >
                      <Text>Foto de Paquete</Text>
                    </Button>
                    {form.image !== '' ? (
                      <Image
                        style={{
                          width: 80,
                          height: 120,
                          marginVertical: -18,
                          marginBottom: 0,
                          marginTop: 20,
                          top: 4,
                        }}
                        source={{
                          uri: form.image,
                        }}
                      />
                    ) : null}
                  </Row>
                  <TakePhotoModal
                    visible={isTakePhotoModalOpen}
                    onClose={() => toggleTakePhotoModal(false)}
                    onPhotoTaken={savePhoto}
                    animationType="slide"
                  />
                  <Question> Estimated Price: </Question>
                  <Price> $18.00 </Price>
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
                    disabled={submitting}
                    onPress={submit}
                  >
                    Confirmar Entrega
                  </SigninButton>
                  <Button appearance="ghost" onPress={() => back()}>
                    Atras, cambair informacion
                  </Button>
                </Content>
              ) : null}

              {page === 2 ? (
                <Content>
                  <CreditCard
                    type={creditCard.type}
                    imageFront={require('./components/images/card-front.png')}
                    imageBack={require('./components/images/card-back.png')}
                    shiny={false}
                    bar={false}
                    focused="number"
                    number={creditCard.number}
                    name={creditCard.name}
                    expiry={creditCard.expiry}
                    cvc={creditCard.cvc}
                  />
                  <Input
                    size="large"
                    autoCapitalize="none"
                    value={creditCard.name}
                    label="Nombre"
                    placeholder="Cual es el nombre en la tarjeta?"
                    caption={submittedTry && isEmailError && 'Ingresa un correo electrónico válido'}
                    captionIcon={(props) =>
                      submittedTry &&
                      isEmailError && <Icon {...props} name="alert-circle-outline" />
                    }
                    status={submittedTry && isEmailError && 'warning'}
                    accessoryLeft={(props) => <Icon {...props} name="layers-outline" />}
                    onChangeText={(nextValue) => setCreditCard({ ...creditCard, name: nextValue })}
                  />
                  <Row>
                    <Input
                      style={{ width: 160 }}
                      size="large"
                      autoCapitalize="none"
                      value={creditCard.cvc}
                      label="CVC"
                      placeholder="Cual es el codigo de seguridad?"
                      caption={
                        submittedTry && isEmailError && 'Ingresa un correo electrónico válido'
                      }
                      captionIcon={(props) =>
                        submittedTry &&
                        isEmailError && <Icon {...props} name="alert-circle-outline" />
                      }
                      status={submittedTry && isEmailError && 'warning'}
                      accessoryLeft={(props) => <Icon {...props} name="layers-outline" />}
                      onChangeText={(nextValue) => setCreditCard({ ...creditCard, cvc: nextValue })}
                    />
                    <Input
                      style={{ width: 160 }}
                      size="large"
                      autoCapitalize="none"
                      value={creditCard.expiry}
                      label="Expiry Date"
                      placeholder="Cual es el fecha de caducidad"
                      caption={
                        submittedTry && isEmailError && 'Ingresa un correo electrónico válido'
                      }
                      captionIcon={(props) =>
                        submittedTry &&
                        isEmailError && <Icon {...props} name="alert-circle-outline" />
                      }
                      status={submittedTry && isEmailError && 'warning'}
                      accessoryLeft={(props) => <Icon {...props} name="layers-outline" />}
                      onChangeText={(nextValue) =>
                        setCreditCard({ ...creditCard, expiry: nextValue })
                      }
                    />
                  </Row>
                  <Input
                    size="large"
                    autoCapitalize="none"
                    value={creditCard.number}
                    label="Numero "
                    placeholder="Cual es el numero de la tarjeta?"
                    caption={submittedTry && isEmailError && 'Ingresa un correo electrónico válido'}
                    captionIcon={(props) =>
                      submittedTry &&
                      isEmailError && <Icon {...props} name="alert-circle-outline" />
                    }
                    status={submittedTry && isEmailError && 'warning'}
                    accessoryLeft={(props) => <Icon {...props} name="layers-outline" />}
                    onChangeText={(nextValue) =>
                      setCreditCard({ ...creditCard, number: nextValue })
                    }
                  />
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
                    disabled={submitting}
                    onPress={next}
                  >
                    Routes Dashboard
                  </SigninButton>
                </Content>
              ) : null}
            </>
          ) : (
            <>
              {page === 3 ? (
                <>
                  <Input
                    size="large"
                    autoCapitalize="none"
                    value={amazon.search}
                    label="Buscar Product"
                    placeholder="Cual es el nombre del Producto?"
                    caption={submittedTry && isEmailError && 'Ingresa un correo electrónico válido'}
                    captionIcon={(props) =>
                      submittedTry &&
                      isEmailError && <Icon {...props} name="alert-circle-outline" />
                    }
                    status={submittedTry && isEmailError && 'warning'}
                    accessoryLeft={(props) => <Icon {...props} name="pricetags-outline" />}
                    onChangeText={(nextValue) => setAmazon({ ...amazon, search: nextValue })}
                  />
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
                    disabled={submitting}
                    onPress={amazonSearch}
                  >
                    Search
                  </SigninButton>
                </>
              ) : null}
              {page === 4 ? (
                <>
                  {amazonResult !== null && selectedProduct === null ? (
                    <>
                      <List
                        data={amazonResult}
                        style={styles.container}
                        renderItem={({ item }) => (
                          <Card
                            status="basic"
                            header={(headerProps) => (
                              <View {...headerProps}>
                                <Image
                                  style={{
                                    width: '100%',
                                    height: 140,
                                    marginVertical: -18,
                                    marginBottom: 0,
                                    top: 4,
                                    resizeMode: 'contain',
                                  }}
                                  source={{
                                    uri: item.imageUrl,
                                  }}
                                />
                              </View>
                            )}
                            footer={(footerProps) => (
                              <Row>
                                <Text {...footerProps}>
                                  USD $ {item.prices[0] ? item.prices[0].price : null}
                                </Text>
                                <Button
                                  style={{ margin: 20 }}
                                  size="medium"
                                  onPress={() => addToCart(item)}
                                >
                                  BUY
                                </Button>
                              </Row>
                            )}
                          >
                            <Content>
                              <Image
                                style={{
                                  width: 80,
                                  height: 20,
                                  marginVertical: -16,
                                  marginBottom: 22,
                                  resizeMode: 'contain',
                                  right: 20,
                                  top: 20,
                                }}
                                source={{
                                  uri:
                                    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png',
                                }}
                              />
                              <Text>{item.title}</Text>
                            </Content>
                          </Card>
                        )}
                      />
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
                        disabled={submitting}
                        onPress={backAmazon}
                      >
                        Buscar otro Producto
                      </SigninButton>
                    </>
                  ) : (
                    <>
                      {selectedProduct === null ? (
                        <View style={{ flexDirection: 'column' }}>
                          <Spinner style={{ alignSelf: 'center' }} size="giant" />
                        </View>
                      ) : null}
                    </>
                  )}
                  {selectedProduct !== null ? (
                    <Content>
                      <View>
                        <Carousel
                          data={cart}
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
                        <Button style={{ width: 150 }} onPress={() => setSelectedProduct(null)}>
                          <Text style={{ fontSize: 9 }}>Agregar Producto</Text>
                        </Button>
                      </View>
                      <Text
                        style={{
                          fontSize: 13,
                          marginBottom: 4,
                          marginTop: 10,
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
                          setAmazonDestination({
                            address: data.description,
                            placeId: data.place_id,
                            location: details.geometry.location,
                            country: getCountry(details),
                          });
                        }}
                        query={{
                          key: 'AIzaSyCcdE49CrgHx3DZeqx3gmXg7VVwjrzNE7k',
                          language: 'en',
                        }}
                      />

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
                        <Text> Product Price: ${selectedProduct.prices[0].price} </Text>
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
                        disabled={amazonDestination === ''}
                        onPress={submitAmazon}
                      >
                        Confirmar Pedido
                      </SigninButton>
                      <Button appearance="ghost" onPress={() => setSelectedProduct(null)}>
                        Cancelar
                      </Button>
                    </Content>
                  ) : null}
                </>
              ) : null}
            </>
          )}
        </Container>
      </KeyboardAwareScroll>
    </>
  );
};

export default Send;
