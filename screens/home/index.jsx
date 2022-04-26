import React, { useState, useEffect } from 'react';
import firebase from 'firebase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Image,
  View,
  ScrollView,
  ImageBackground,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useTheme, Text, Button, Icon } from '@ui-kitten/components';
import Carousel from 'react-native-snap-carousel';
import shortid from 'shortid';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Header from './components/header';
import CarouselItem from './carousel-item';
import { Row, Container, Input } from './elements';

const Home = () => {
  const { top } = useSafeAreaInsets();
  const theme = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  // const [loadingServices, setLoadingServices] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [categories, setCategories] = useState([]);

  const { navigate } = useNavigation();

  const [scrollY, setScrollY] = useState(0);
  const [amazon, setAmazon] = useState({
    search: '',
  });

  useEffect(() => {
    const db = firebase.firestore();

    const query = async () => {
      db.collection('Promotions').onSnapshot((querySnapshot) => {
        const info = [];
        // eslint-disable-next-line func-names
        querySnapshot.forEach((doc) => {
          info.push(doc.data());
        });
        setPromotions(info);
        setLoading(false);
      });
    };

    query();
  }, []);

  useEffect(() => {
    const db = firebase.firestore();

    const query = async () => {
      db.collection('Categories').onSnapshot((querySnapshot) => {
        const info = [];
        // eslint-disable-next-line func-names
        querySnapshot.forEach((doc) => {
          info.push(doc.data());
        });
        setCategories(info);
      });
    };

    query();
  }, []);

  return (
    <>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>
        <StatusBar style="auto" pt={top} />
        <Header />
        <ScrollView
          scrollEventThrottle={16}
          onScroll={(e) => {
            setScrollY(e.nativeEvent.contentOffset.y);
          }}
        >
          <ImageBackground
            style={{ width: '100%', height: 500, opacity: 1 - scrollY / 500 }}
            // eslint-disable-next-line global-require
            source={require('./images/home_background.jpeg')}
          >
            <Input
              size="large"
              autoCapitalize="none"
              value={amazon.search}
              placeholder="¡Busca cualquier producto!"
              accessoryLeft={(props) => <Icon {...props} name="pricetags-outline" />}
              accessoryRight={(props) => (
                <Button
                  onPress={() => navigate('Send', { page: 3, type: 1, search: amazon.search })}
                  style={{
                    margin: -12,
                    borderTopRightRadius: 18,
                    borderBottomRightRadius: 18,
                    backgroundColor: 'black',
                  }}
                >
                  <Icon {...props} fill="#FFD700" name="search" />
                </Button>
              )}
              onChangeText={(nextValue) => setAmazon({ ...amazon, search: nextValue })}
            />
            <Text
              style={{
                fontWeight: '300',
                fontSize: 18,
                color: 'white',
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: 80,
              }}
            >
              ¿Ya sabes que vas a pedir?
            </Text>
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
              onPress={() => navigate('Send', { page: 3, type: 1 })}
            >
              <Text style={{ color: '#FFD700' }}>Pega el URL</Text>
            </Button>
          </ImageBackground>
          <Container>
            {loading === false ? (
              <>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 18,
                    color: 'black',
                    margin: 20,
                  }}
                >
                  Explora nuestros servicios
                </Text>
                <Row>
                  <Button appearance="ghost" onPress={() => navigate('Send')}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        height: 120,
                        width: 170,
                      }}
                    >
                      <Image
                        style={{ width: 80, height: 80, marginRight: 10, borderRadius: 10 }}
                        // eslint-disable-next-line global-require
                        source={require('./images/home_enviar.jpg')}
                      />
                      <View>
                        <Text style={{ fontWeight: 'bold', color: 'black' }}>Pedir</Text>
                        <Text
                          style={{ fontWeight: '300', color: 'black', fontSize: 8, width: 100 }}
                        >
                          Todo lo que quieras hasta la puerta de tu casa
                        </Text>
                      </View>
                    </View>
                  </Button>
                  <Button appearance="ghost" onPress={() => navigate('Deliver')}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        height: 120,
                        width: 170,
                      }}
                    >
                      <Image
                        style={{ width: 80, height: 80, marginRight: 10, borderRadius: 10 }}
                        // eslint-disable-next-line global-require
                        source={require('./images/home_deliver.jpg')}
                      />
                      <View>
                        <Text style={{ fontWeight: 'bold', color: 'black' }}>Viajar</Text>
                        <Text
                          style={{ fontWeight: '300', color: 'black', fontSize: 8, width: 100 }}
                        >
                          Aprovecha tus viajes y gana dinero extra por traer productos
                        </Text>
                      </View>
                    </View>
                  </Button>
                </Row>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 18,
                    color: 'black',
                    margin: 20,
                  }}
                >
                  Explora los mejores productos
                </Text>
                <Carousel
                  data={promotions}
                  renderItem={(props) => (
                    <CarouselItem
                      key={shortid.generate()}
                      {...props}
                      type="Products"
                      theme={theme}
                      cache={shortid.generate()}
                      navigation={navigation}
                    />
                  )}
                  sliderWidth={420}
                  itemWidth={230}
                  activeSlideAlignment="start"
                  inactiveSlideOpacity={0.9}
                  inactiveSlideScale={0.9}
                />
                <View
                  style={{
                    height: 450,
                    marginTop: 40,
                    backgroundColor: '#28282B',
                    marginLeft: 15,
                    marginRight: 15,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 20,
                      color: 'white',
                      top: 50,
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      textAlign: 'center',
                    }}
                  >
                    Aprovecha tus viajes y gana dinero extra por traer productos
                  </Text>
                  <Text
                    style={{
                      fontWeight: '400',
                      fontSize: 15,
                      width: 250,
                      color: 'white',
                      textAlign: 'center',
                      top: 50,
                      marginTop: 10,
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                  >
                    Gana dinero extra en tus viajes, aprovecha no pierdas la oportunidad
                  </Text>
                  <Button
                    style={{
                      width: 180,
                      height: 50,
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      marginTop: 70,
                      borderRadius: 10,
                      backgroundColor: 'white',
                      borderColor: '#FFD700',
                    }}
                    size="small"
                    onPress={() => navigate('Deliver')}
                  >
                    <Text style={{ color: 'black', fontWeight: 'bold' }}>Viaja Ahora</Text>
                  </Button>
                  <Image
                    style={{
                      width: 'auto',
                      height: 190,
                      marginTop: 30,
                      borderBottomLeftRadius: 20,
                      borderBottomRightRadius: 20,
                    }}
                    // eslint-disable-next-line global-require
                    source={require('./images/home_footer.jpeg')}
                  />
                </View>
                <View style={{ marginBottom: 100 }}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 18,
                      color: 'black',
                      margin: 20,
                      marginTop: 40,
                    }}
                  >
                    Explora lo que Necesitas
                  </Text>
                  <Carousel
                    data={categories}
                    renderItem={(props) => (
                      <CarouselItem
                        key={shortid.generate()}
                        {...props}
                        type="Category"
                        theme={theme}
                        cache={shortid.generate()}
                        navigation={navigation}
                      />
                    )}
                    sliderWidth={420}
                    itemWidth={230}
                    activeSlideAlignment="start"
                    inactiveSlideOpacity={0.9}
                    inactiveSlideScale={0.9}

                    // onSnapToItem={setSelected}
                  />
                </View>
                {/* <List style={styles.container} data={services} renderItem={renderItem} /> */}
              </>
            ) : null}
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Home;
