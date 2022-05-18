/* eslint-disable no-plusplus */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import KeyboardAwareScroll from '@components/keyboard-aware-scroll';
import firebase from 'firebase';
import { useNavigation } from '@react-navigation/native';
import shortid from 'shortid';
import { useAuth } from '@providers/auth';
import 'firebase/functions';
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
  Select,
  SelectItem,
  Card,
  IndexPath,
} from '@ui-kitten/components';
import Carousel from 'react-native-snap-carousel';
import Modal from './components/modal';
import ModalDestination from './components/modal-destination';
import TakePhotoModal from '../../templates/take-photo-modal';
import CarouselItem from './components/carousel-item';
import { Container, Content, Input, SigninButton, Row } from './elements';

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

const Send = ({ route }) => {
  const { params } = route;

  const ref = useRef();
  const { top } = useSafeAreaInsets();
  const { user } = useAuth();
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

  const [amazon, setAmazon] = useState({
    search: '',
    url: '',
  });

  const [amazonResult, setAmazonResult] = useState(null);
  const [amazonProduct, setAmazonProduct] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);

  const [page, setPage] = useState(0);

  // Form Conditionals
  const [submittedTry, setSubmittedTry] = useState(false);
  const [isAddressError, setIsAddressError] = useState(true);
  const [isValueError, setIsValueError] = useState(true);
  const [isWeightError, setIsWeightError] = useState(true);
  const [isQuantityError, setIsQuantityError] = useState(true);
  const [isImageError, setIsImageError] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [isTakePhotoModalOpen, toggleTakePhotoModal] = useState(false);

  const [precio, setPrecio] = useState({ precio: '', impuestos: '', total: '' });

  const [isModalOpen, toggleModal] = useState(false);
  const [isModalDestinationOpen, toggleModalDestination] = useState(false);

  useEffect(() => {
    if (params) {
      setPage(params.page);
      setSelectedIndex(params.type);
      if (params.search) {
        setAmazon({ url: '', search: params.search });
      }
      if (params.url) {
        setAmazon({ url: params.url, search: '' });
      }
    }
  }, [params]);

  useEffect(() => {
    if (form.destination !== '' && form.startPoint !== '') {
      setIsAddressError(form.destination.country !== form.startPoint.country);
    } else {
      setIsAddressError(false);
    }
  }, [form.destination, form.startPoint]);

  useEffect(() => {
    setIsValueError(form.value <= 0);
  }, [form.value]);

  useEffect(() => {
    setIsWeightError(form.weight < 0.5);
  }, [form.weight]);

  useEffect(() => {
    setIsImageError(!form.image);
  }, [form.image]);

  useEffect(() => {
    setIsQuantityError(form.quantity <= 0);
  }, [form.quantity]);

  const next = async () => {
    if (isAddressError || isValueError || isWeightError || isQuantityError) {
      setSubmittedTry(true);
      return;
    }
    const precio2 =
      parseFloat(form.value) * 0.05 +
      parseFloat(form.weight) * 1.5 +
      getDistanceFromLatLonInKm(
        form.startPoint.location.lat,
        form.startPoint.location.lng,
        form.destination.location.lat,
        form.destination.location.lng
      ) *
        0.015;
    setPrecio({
      precio: precio2.toFixed(2),
      impuesto: (precio2 * 0.085).toFixed(2),
      total: (precio2 * 1.085).toFixed(2),
    });
    setPage(1);
  };

  const back = async () => {
    setPage(0);
  };

  const savePhoto = async ({ imageBlob }) => {
    // Do not request access because this relies on the driver already gave access
    // in the Home screen
    const imgRef = firebase.storage().ref().child(`service-images/${shortid.generate()}`);
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

  // Price Calculators

  const getTotalAmazonPrice = () => {
    let num = 0;
    for (let i = 0; i < cart.length; i++) {
      if (!cart[i].prices[0]) {
        num = 'Pendiente';
        i = cart.length;
        return num;
      }
      num += parseFloat(cart[i].prices[0].price);
    }
    return (num * 1.09).toFixed(2);
  };
  const getTotalAmazonDelivery = () => {
    let num = 0;
    for (let i = 0; i < cart.length; i++) {
      if (!cart[i].category || !cart[i].weigth) {
        num = 'Pendiente';
        return num;
      }
      if (cart[i].category.name === 'Otro') {
        num += cart[i].weigth * 6.5 * 1.15 * 1.13 * 1.03;
      } else {
        num += cart[i].category.value * 1.13 * 1.03;
      }
    }
    return num.toFixed(2);
  };

  const getFee = () => {
    let num = getTotalAmazonPrice();
    num *= 0.036;
    return num.toFixed(2);
  };

  const getTotalAmazon = () => {
    const num =
      parseFloat(getTotalAmazonPrice()) +
      parseFloat(getTotalAmazonDelivery()) +
      parseFloat(getFee());

    return num.toFixed(2);
  };

  const submit = async () => {
    setSubmitting(true);
    const db = firebase.firestore();
    db.collection('Services')
      .add({
        ...form,
        dateCreated: new Date(),
        status: 'Buscando Chofer',
        userID: user.uid,
        payed: false,
        total: precio,
        driverID: '',
        senderName: `${user.firstName} ${user.lastName}`,
        type: 'Local',
        lastMessage: '',
        lastMessageDate: null,
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
  const amazonURL = async () => {
    const functions = firebase.functions();
    setPage(5);
    functions
      .httpsCallable('urlProducts')(amazon.url)
      .then((response) => {
        setAmazonProduct(response.data);
      })
      .catch(() => {
        setAmazonProduct('error');
      });
  };

  const backAmazon = async () => {
    setPage(3);
    setAmazonResult(null);
    setAmazonProduct(null);
  };

  const [amazonDestination, setAmazonDestination] = useState('');
  const [amazonDate, setAmazonDate] = useState(new Date());

  const submitAmazon = async () => {
    setSubmitting(true);
    const db = firebase.firestore();
    db.collection('Services')
      .add({
        destination: amazonDestination,
        dateCreated: new Date(),
        status: 'Buscando Chofer',
        type: 'Amazon',
        total: {
          products: parseFloat(getTotalAmazonPrice()),
          fee: parseFloat(getFee()),
          delivery: parseFloat(getTotalAmazonDelivery()),
          total: getTotalAmazon(),
        },
        payed: false,
        arrivalDate: amazonDate,
        senderName: `${user.firstName} ${user.lastName}`,
        products: cart,
        userID: user.uid,
        driverID: '',
        lastMessage: '',
        lastMessageDate: null,
      })
      .then(async (docRef) => {
        db.collection('Services').doc(docRef.id).update({ id: docRef.id });
        setPage(3);
        setSelectedProduct(null);
        setAmazonResult(null);
        setAmazonDestination('');
        setAmazonProduct(null);
        setCart([]);
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

  // Get Country

  // eslint-disable-next-line consistent-return
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

  const removeFromCart = (index) => {
    const temp = cart;
    temp.splice(index, 1);
    setCart(temp);
  };

  const addToCartURL = (data) => {
    setSelectedProduct({
      imageUrl: data.product.images[0].link,
      prices: [
        {
          price: data.product.buybox_winner.price
            ? data.product.buybox_winner.price.value
            : 'undefined',
        },
      ],
      productUrl: data.product.link,
      title: data.product.title,
    });
    const temp = cart;
    temp.push({
      imageUrl: data.product.images[0].link,
      prices: [
        {
          price: data.product.buybox_winner.price
            ? data.product.buybox_winner.price.value
            : undefined,
        },
      ],
      productUrl: data.product.link,
      title: data.product.title,
    });
    setCart(temp);
  };

  const [manulProduct, setManulProduct] = useState({
    imageUrl: '',
    prices: [],
    productUrl: '',
    title: '',
    peso: '',
  });

  const categories = [
    { name: 'Otro', value: 0 },
    { name: 'Smartwatch', value: 35.0 },
    { name: 'Celular', value: 50.0 },
    { name: 'Laptop', value: 55.0 },
    { name: 'Consola de videojuego', value: 60.0 },
    { name: 'Tablet', value: 50.0 },
    { name: 'Camara', value: 40.0 },
    { name: 'Audifonos', value: 25.0 },
  ];
  const [categoriesIndex, setCategoriesIndex] = useState(new IndexPath(0));

  const addToCartManual = () => {
    setSelectedProduct({
      imageUrl: manulProduct.imageUrl,
      prices: [{ price: manulProduct.price }],
      productUrl: manulProduct.productUrl,
      title: manulProduct.title,
      weigth: manulProduct.peso,
      category: categories[categoriesIndex.row],
    });
    const temp = cart;
    temp.push({
      imageUrl: manulProduct.imageUrl,
      prices: [{ price: manulProduct.price }],
      productUrl: manulProduct.productUrl,
      title: manulProduct.title,
      weigth: manulProduct.peso,
      category: categories[categoriesIndex.row],
    });
    setAmazonProduct(null);
    setManulProduct({ imageUrl: '', prices: [], productUrl: '', title: '', peso: '' });
    setCart(temp);
  };
  const cancelOrder = () => {
    setSelectedProduct(null);
    setCart([]);
  };

  const addAnotherProduct = () => {
    setSelectedProduct(null);
    setAmazonResult(null);
    setAmazonDestination('');
    setAmazonProduct(null);
    setPage(3);
  };

  const [modalItem, setModalItem] = useState({ index: null, item: null });

  const handelModal = (index) => {
    setModalItem({ index, item: cart[index] });
    toggleModal(true);
  };

  return (
    <>
      <TabBar
        style={{ paddingTop: top }}
        selectedIndex={selectedIndex}
        onSelect={(index) => SetTab(index)}
      >
        <Tab title="Local" icon={CubeIcon} />
        <Tab title="Internacional" icon={GlobeIcon} />
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
                    Dirección de comienzo
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
                    Dirección de destino
                  </Text>
                  <GooglePlacesAutocomplete
                    ref={ref}
                    placeholder="Buscar dirección..."
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
                    label="Valor ($USD)"
                    keyboardType="numeric"
                    placeholder="¿Cuál es el valor del paquete?"
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
                      label="Peso (Libras)"
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
                    ¡Siguiente paso!
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
                  <Datepicker
                    label="¿Qué fecha quieres que llegue tu paquete?"
                    date={form.date}
                    filter={(date) => new Date() < date}
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
                  <View
                    style={{
                      width: 350,
                      heigth: 400,
                      marginTop: 25,
                      borderRadius: 20,
                      borderColor: 'black',
                      borderWidth: 0.5,
                      padding: 20,
                    }}
                  >
                    <Text>Costo de envío: ${precio.precio} </Text>
                    {/* <Text style={{ marginBottom: 10 }}> Impuestos: ${precio.impuesto}</Text> */}
                    <Divider />
                    <Text style={{ marginTop: 10, fontWeight: '700' }}>
                      Total: ${precio.precio}
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
                    disabled={submitting || isImageError}
                    onPress={submit}
                  >
                    ¡Confirma pedido,es gratis!
                  </SigninButton>
                  <Button appearance="ghost" onPress={() => back()}>
                    Atrás, cambiar información
                  </Button>
                </Content>
              ) : null}
            </>
          ) : (
            <>
              {page === 3 ? (
                <Container>
                  <Input
                    size="large"
                    autoCapitalize="none"
                    value={amazon.search}
                    label="Buscar Producto"
                    placeholder="¿Cuál es el nombre del producto?"
                    accessoryLeft={(props) => <Icon {...props} name="pricetags-outline" />}
                    onChangeText={(nextValue) => setAmazon({ ...amazon, search: nextValue })}
                  />
                  <SigninButton
                    style={{ marginBottom: 40 }}
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
                    Buscar por Nombre
                  </SigninButton>
                  <Input
                    size="large"
                    autoCapitalize="none"
                    value={amazon.url}
                    label="Buscar URL"
                    placeholder="¿Cuál es el URL del producto?"
                    accessoryLeft={(props) => <Icon {...props} name="link-2-outline" />}
                    onChangeText={(nextValue) => setAmazon({ ...amazon, url: nextValue })}
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
                    onPress={amazonURL}
                  >
                    Buscar URL
                  </SigninButton>
                </Container>
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
                                  Agregar
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

                      <SigninButton onPress={backAmazon}>Buscar otro producto</SigninButton>
                    </>
                  ) : (
                    <>
                      {selectedProduct === null ? (
                        <View style={{ top: 200 }}>
                          <View
                            style={{
                              marginLeft: 'auto',
                              marginRight: 'auto',
                              marginBottom: 20,
                            }}
                          >
                            <Spinner size="giant" />
                          </View>
                          <Text style={{ fontSize: 15, textAlign: 'center' }}>
                            Buscando productos!
                          </Text>
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
                            <CarouselItem key={shortid.generate()} {...props} modal={handelModal} />
                          )}
                          sliderWidth={480}
                          itemWidth={200}
                          activeSlideAlignment="start"
                          inactiveSlideOpacity={0.9}
                          inactiveSlideScale={0.9}

                          // onSnapToItem={setSelected}
                        />
                        <Button style={{ width: '60%' }} onPress={addAnotherProduct}>
                          <Text style={{ fontSize: 10 }}>Agregar Otro Producto</Text>
                        </Button>
                      </View>
                      <Text style={{ color: 'red', marginTop: 20, marginBottom: 20 }}>
                        {getTotalAmazonPrice() === 'Pendiente' ||
                        getTotalAmazonDelivery() === 'Pendiente'
                          ? 'Dale click a “Pendiente” para completarlo'
                          : null}
                      </Text>
                      <Datepicker
                        label="¿Qué fecha quieres que llegue tu paquete?"
                        date={amazonDate}
                        filter={(date) => new Date() < date}
                        onSelect={(nextDate) => setAmazonDate(nextDate)}
                      />
                      <View
                        style={{
                          width: '100%',
                          heigth: 400,
                          marginTop: 40,
                          borderRadius: 20,
                          borderColor: 'black',
                          borderWidth: 0.5,
                          padding: 20,
                        }}
                      >
                        <Text style={{ fontWeight: '700' }}>
                          Total: $
                          {getTotalAmazonPrice() === 'Pendiente' ||
                          getTotalAmazonDelivery() === 'Pendiente'
                            ? 'Pendiente'
                            : getTotalAmazon()}
                          <Text style={{ fontWeight: '400', fontSize: 7 }}>USD</Text>
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
                        disabled={
                          getTotalAmazonPrice() === 'Pendiente' ||
                          getTotalAmazonDelivery() === 'Pendiente'
                        }
                        onPress={() => toggleModalDestination(true)}
                      >
                        Seleccionar país de destino
                      </SigninButton>
                      <Button appearance="ghost" onPress={cancelOrder}>
                        Cancelar
                      </Button>
                      <ModalDestination
                        visible={isModalDestinationOpen}
                        onClose={() => toggleModalDestination(false)}
                        item={modalItem}
                        submit={submitAmazon}
                        setDestination={setAmazonDestination}
                        cart={cart}
                      />
                    </Content>
                  ) : null}
                </>
              ) : null}
              {page === 5 ? (
                <>
                  {amazonProduct !== null &&
                  selectedProduct === null &&
                  amazonProduct !== 'error' ? (
                    <View>
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
                                uri: amazonProduct.product.images[0].link,
                              }}
                            />
                          </View>
                        )}
                        footer={(footerProps) => (
                          <Row>
                            <Text {...footerProps}>
                              USD ${' '}
                              {amazonProduct.product.buybox_winner.price
                                ? amazonProduct.product.buybox_winner.price.value
                                : 'Undefined'}
                            </Text>
                            <Button
                              style={{ margin: 20 }}
                              size="medium"
                              onPress={() => addToCartURL(amazonProduct)}
                            >
                              Agregar
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
                          <Text>{amazonProduct.product.title}</Text>
                        </Content>
                      </Card>
                      <SigninButton appearance="ghost" onPress={backAmazon}>
                        Buscar otro producto
                      </SigninButton>
                    </View>
                  ) : (
                    <>
                      {amazonProduct !== 'error' ? (
                        <View style={{ top: 200 }}>
                          <View
                            style={{
                              marginLeft: 'auto',
                              marginRight: 'auto',
                              marginBottom: 20,
                            }}
                          >
                            <Spinner size="giant" />
                          </View>
                          <Text style={{ fontSize: 15, textAlign: 'center' }}>
                            Buscando productos
                          </Text>
                        </View>
                      ) : (
                        <View>
                          <Text
                            style={{
                              textAlign: 'center',
                              width: '80%',
                              marginRight: 'auto',
                              marginLeft: 'auto',
                              fontWeight: '700',
                              fontSize: 15,
                            }}
                          >
                            No se encontró tu producto. Ingresa los valores manualmente.
                          </Text>
                          <Input
                            size="large"
                            autoCapitalize="none"
                            value={manulProduct.productUrl}
                            label="URL"
                            placeholder="¿Cuál es el URL del producto?"
                            accessoryLeft={(props) => <Icon {...props} name="pricetags-outline" />}
                            onChangeText={(nextValue) =>
                              setManulProduct({ ...manulProduct, productUrl: nextValue })
                            }
                          />
                          <Input
                            size="large"
                            autoCapitalize="none"
                            value={manulProduct.title}
                            label="Nombre del producto"
                            placeholder="¿Cuál es el nombre del producto?"
                            accessoryLeft={(props) => <Icon {...props} name="pricetags-outline" />}
                            onChangeText={(nextValue) =>
                              setManulProduct({ ...manulProduct, title: nextValue })
                            }
                          />
                          <Input
                            size="large"
                            autoCapitalize="none"
                            value={manulProduct.price}
                            label="Precio (USD) sin tax"
                            keyboardType="numeric"
                            placeholder="¿Cuál es precio del producto?"
                            accessoryLeft={(props) => <Icon {...props} name="pricetags-outline" />}
                            onChangeText={(nextValue) =>
                              setManulProduct({ ...manulProduct, price: nextValue })
                            }
                          />
                          <Input
                            size="large"
                            autoCapitalize="none"
                            value={manulProduct.peso}
                            label="Peso (Libras)"
                            keyboardType="numeric"
                            placeholder="¿Cuál es el peso del producto?"
                            accessoryLeft={(props) => <Icon {...props} name="pricetags-outline" />}
                            onChangeText={(nextValue) =>
                              setManulProduct({ ...manulProduct, peso: nextValue })
                            }
                          />
                          <Text style={{ marginTop: 5, marginBottom: 10 }}>
                            Selecciona la categoría del producto
                          </Text>
                          <Select
                            size="large"
                            value={categories[categoriesIndex.row].name}
                            selectedIndex={categoriesIndex}
                            onSelect={(index) => setCategoriesIndex(index)}
                          >
                            {categories.map((category) => {
                              return <SelectItem title={category.name} />;
                            })}
                          </Select>
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
                            disabled={
                              manulProduct.peso === '' ||
                              manulProduct.productUrl === '' ||
                              manulProduct.title === '' ||
                              manulProduct.price === ''
                            }
                            onPress={addToCartManual}
                          >
                            Cotizar
                          </SigninButton>
                          <SigninButton appearance="ghost" onPress={backAmazon}>
                            Buscar otro producto
                          </SigninButton>
                        </View>
                      )}
                    </>
                  )}
                  {selectedProduct !== null ? (
                    <Content style={{ top: '-10%' }}>
                      <View>
                        <Carousel
                          data={cart}
                          renderItem={(props) => (
                            <CarouselItem key={shortid.generate()} {...props} modal={handelModal} />
                          )}
                          sliderWidth={480}
                          itemWidth={200}
                          activeSlideAlignment="start"
                          inactiveSlideOpacity={0.9}
                          inactiveSlideScale={0.9}

                          // onSnapToItem={setSelected}
                        />
                        <Button style={{ width: '60%' }} onPress={addAnotherProduct}>
                          <Text style={{ fontSize: 10 }}>Agregar Otro Producto</Text>
                        </Button>
                      </View>
                      <Text style={{ color: 'red', marginTop: 20 }}>
                        {getTotalAmazonPrice() === 'Pendiente' ||
                        getTotalAmazonDelivery() === 'Pendiente'
                          ? 'Dale click a “Pendiente” para completarlo'
                          : null}
                      </Text>
                      <Datepicker
                        label="¿Qué fecha quieres que llegue tu paquete?"
                        date={amazonDate}
                        filter={(date) => new Date() < date}
                        onSelect={(nextDate) => setAmazonDate(nextDate)}
                      />
                      <View
                        style={{
                          width: '100%',
                          heigth: 400,
                          marginTop: 40,
                          borderRadius: 20,
                          borderColor: 'black',
                          borderWidth: 0.5,
                          padding: 20,
                        }}
                      >
                        <Text style={{ marginTop: 10, fontWeight: '700' }}>
                          Total: $
                          {getTotalAmazonPrice() === 'Pendiente' ||
                          getTotalAmazonDelivery() === 'Pendiente'
                            ? 'Pendiente'
                            : getTotalAmazon()}
                          <Text style={{ fontWeight: '400', fontSize: 7 }}>USD</Text>
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
                        disabled={
                          getTotalAmazonPrice() === 'Pendiente' ||
                          getTotalAmazonDelivery() === 'Pendiente'
                        }
                        onPress={() => toggleModalDestination(true)}
                      >
                        Seleccionar país de destino
                      </SigninButton>
                      <Button appearance="ghost" onPress={cancelOrder}>
                        Cancelar
                      </Button>
                      <ModalDestination
                        visible={isModalDestinationOpen}
                        onClose={() => toggleModalDestination(false)}
                        item={modalItem}
                        submit={submitAmazon}
                        setDestination={setAmazonDestination}
                        cart={cart}
                      />
                    </Content>
                  ) : null}
                </>
              ) : null}
            </>
          )}
        </Container>
        <Modal
          visible={isModalOpen}
          onClose={() => toggleModal(false)}
          item={modalItem}
          setCart={setCart}
          cart={cart}
          removeFromCart={removeFromCart}
        />
      </KeyboardAwareScroll>
    </>
  );
};

export default Send;
