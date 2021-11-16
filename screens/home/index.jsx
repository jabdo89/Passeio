import React, { useState, useEffect } from 'react';
import firebase from 'firebase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, Image, View, ScrollView, ImageBackground } from 'react-native';
import KeyboardAwareScroll from '@components/keyboard-aware-scroll';
import { useTheme, Avatar, Card, Text, List, ListItem, Button, Icon } from '@ui-kitten/components';
import Carousel from 'react-native-snap-carousel';
import shortid from 'shortid';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Header from './components/header';
import CarouselItem from './carousel-item';
import {
  Welcome,
  AvatarSection,
  WelcomeSubTitle,
  Row,
  HeaderSection,
  Container,
  HeaderRow,
  Input,
} from './elements';

const Home = () => {
  const { top } = useSafeAreaInsets();
  const theme = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  // const [loadingServices, setLoadingServices] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [services, setServices] = useState([]);

  const { navigate } = useNavigation();

  const [scrollY, setScrollY] = useState(0);
  const [amazon, setAmazon] = useState({
    search: '',
  });
  const styles = StyleSheet.create({
    container: {
      maxHeight: 250,
      marginTop: 10,
      height: 250,
    },
    icon: {
      width: 32,
      height: 32,
    },
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
      const user = firebase.auth().currentUser;
      // const userData = await db.collection('Usuarios').doc(user.uid).get();
      // const profile = userData.data();

      db.collection('Services').onSnapshot((querySnapshot) => {
        const info = [];
        // eslint-disable-next-line func-names
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userID === user.uid) {
            info.push(doc.data());
          }
        });
        setServices(info);
        setLoading(false);
      });
    };
    if (loading === true) {
      query();
    }
  }, []);

  return (
    <>
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
          source={require('./images/home_background.jpeg')}
        >
          <Input
            size="large"
            autoCapitalize="none"
            value={amazon.search}
            placeholder="Busca cualquier Producto!"
            accessoryLeft={(props) => <Icon {...props} name="pricetags-outline" />}
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
            Ya sabes que vas a pedir?
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
                <Row style={{ height: 120, width: 120 }}>
                  <Image
                    style={{ width: 80, height: 80, marginRight: 10, borderRadius: 10 }}
                    source={require('./images/home_enviar.jpg')}
                  />
                  <View>
                    <Text style={{ fontWeight: 'bold', color: 'black' }}>Enviar</Text>
                    <Text style={{ fontWeight: '300', color: 'black', fontSize: 8 }}>
                      Todo lo que quieras, hasta la puerta de tu casa.
                    </Text>
                  </View>
                </Row>
                <Row style={{ height: 120, width: 120, marginLeft: 90 }}>
                  <Image
                    style={{ width: 80, height: 80, marginRight: 10, borderRadius: 10 }}
                    source={require('./images/home_deliver.jpg')}
                  />
                  <View>
                    <Text style={{ fontWeight: 'bold', color: 'black' }}>Entregar</Text>
                    <Text style={{ fontWeight: '300', color: 'black', fontSize: 8 }}>
                      Aprovecha tus viajes, y gana un dinero extra por traer productos
                    </Text>
                  </View>
                </Row>
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
              <View
                style={{
                  height: 450,
                  marginTop: 40,
                  backgroundColor: '#28282B',
                  marginLeft: 15,
                  marginRight: 15,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}
              >
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 23,
                    color: 'white',
                    top: 50,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                >
                  Prueba Viajar
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
                >
                  <Text style={{ color: 'black', fontWeight: 'bold' }}>Viaja Ahora</Text>
                </Button>
                <Image
                  style={{ width: 'auto', height: 190, marginTop: 30 }}
                  source={require('./images/home_footer.jpeg')}
                />
              </View>
              {/* <List style={styles.container} data={services} renderItem={renderItem} /> */}
            </>
          ) : null}
        </Container>
      </ScrollView>
    </>
  );
};

export default Home;
