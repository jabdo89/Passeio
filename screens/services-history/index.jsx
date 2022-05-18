import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Carousel from 'react-native-snap-carousel';
import { View, Image, Linking, Platform } from 'react-native';
import shortid from 'shortid';
import firebase from 'firebase';
import PropTypes from 'prop-types';
import { Text, Icon, List, Divider, Tab, TabBar, Button, Alert } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Container, Title } from './elements';
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
      setloading(true);
      db.collection('Services').onSnapshot((querySnapshot) => {
        let envios = [];
        let entregas = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'Completado') {
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

  // Tab Bar
  const EnviarIcon = (props) => <Icon {...props} name="arrowhead-up-outline" />;
  const EntregarIcon = (props) => <Icon {...props} name="car-outline" />;

  const call = async (info) => {
    let number = info;

    if (Platform.OS !== 'android') number = `telprompt:${number}`;
    else number = `tel:${number}`;

    const supported = await Linking.canOpenURL(number);

    if (!supported) Alert.alert('Phone number is not available');
    else await Linking.openURL(number);
  };

  return (
    <Container pt={top}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
        <Icon
          onPress={() => navigate('ServiceList')}
          style={{
            width: 32,
            height: 32,
            marginLeft: 30,
          }}
          fill="black"
          name="arrow-back-outline"
        />
        <Title category="h5">Servicios Completados</Title>
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
      {selectedIndex === 0 && services.length === 0 && !loading && (
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
      {selectedIndex === 1 && servicesEntrega.length === 0 && !loading && (
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
      <List
        data={selectedIndex === 0 ? services : servicesEntrega}
        style={{ maxHeight: '69%', backgroundColor: 'white' }}
        renderItem={({ item }) => (
          <View
            style={{
              width: '90%',
              height: 110,
              borderWidth: 0.2,
              borderRadius: 10,
              marginTop: 20,
              marginLeft: 'auto',
              marginRight: 'auto',
              flexDirection: 'row',
              justifyContent: 'flex-start',
            }}
          >
            {item.type === 'Amazon' ? (
              <View style={{ width: '40%', right: '130%' }}>
                <Carousel
                  data={item.products}
                  layout="tinder"
                  layoutCardOffset="0"
                  renderItem={(props) => <CarouselItem key={shortid.generate()} {...props} />}
                  sliderWidth={280}
                  itemWidth={200}
                  activeSlideAlignment="start"
                  inactiveSlideOpacity={0.9}
                  inactiveSlideScale={0.9}
                />
              </View>
            ) : (
              <View style={{ marginLeft: 0 }}>
                <Image
                  style={{
                    width: 120,
                    height: 110,
                    marginRight: 35,
                    marginBottom: 0,
                  }}
                  source={{
                    uri: item.image,
                  }}
                />
              </View>
            )}
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontWeight: 'bold' }}>
                {moment(item.completedDate.seconds * 1000)
                  .locale('es')
                  .format('ddd, D MMM')}
              </Text>
              <Text style={{ marginTop: 5, marginBottom: 5 }}>
                Referencia: {item.id.substring(0, 6)}
              </Text>
              <Text>Total: ${item.total.total}</Text>
            </View>
          </View>
        )}
      />
      <Divider />
      <Button
        style={{
          width: '100%',
          marginTop: 20,
        }}
        status="primary"
        appearance="ghost"
        onPress={() => call(7702961922)}
      >
        <View style={{ justifyContent: 'space-between', flexDirection: 'row', width: '100%' }}>
          <Text style={{ fontWeight: '500' }}>Marcar a Soporte</Text>
          <Icon height={32} width={32} fill="black" name="phone-call" />
        </View>
      </Button>
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
