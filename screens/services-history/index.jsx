import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Carousel from 'react-native-snap-carousel';
import { View, Image } from 'react-native';
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
  const [loading, setloading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const query = () => {
      const db = firebase.firestore();
      const user = firebase.auth().currentUser;
      db.collection('Services').onSnapshot((querySnapshot) => {
        const servicios = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'Completado') {
            if (data.driverID === user.uid || data.userID === user.uid) {
              servicios.push(doc.data());
            }
          }
        });
        // info = info.slice().sort((a, b) => b.startDate - a.startDate);
        setServices(servicios);
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

      <List
        data={services}
        style={{ maxHeight: '77%', backgroundColor: 'white' }}
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
                {moment(item.dateCreated.seconds * 1000)
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
