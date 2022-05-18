/* eslint-disable react/prop-types */
import React, { useEffect, useState, useRef } from 'react';
import { Alert, View } from 'react-native';
import firebase from 'firebase';
import { useNavigation } from '@react-navigation/native';
import openMap from 'react-native-open-maps';
import shortid from 'shortid';
import { Icon, Divider, Card, Text, Button } from '@ui-kitten/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@providers/auth';
import TakePhotoModal from '../../templates/take-photo-modal';
import { Container, Title, Row, Status, ActionButton, ActionButton2 } from './elements';
import Map from './components/map';

const Done = ({
  route: {
    params: { service: propsService },
  },
}) => {
  const mapRef = useRef({});
  const { top } = useSafeAreaInsets();
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const [progress, setProgress] = useState([]);
  const [loading] = useState(false);

  const [isTakePhotoModalOpen, toggleTakePhotoModal] = useState(false);
  // const [evidence, setEvidence] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [uploadingImage, setUploadingImage] = useState(false);

  // Map Center
  const center = () => {
    const elements = [];
    if (propsService.startPoint) {
      elements.push(propsService.startPoint.address);
    }
    elements.push(propsService.destination.address);

    mapRef.current.fitToSuppliedMarkers(['user', ...elements], {
      edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
      animated: true,
    });
  };

  const openNavigationMap = (info) => {
    let end;

    // Add func to pick up package or deliver Package
    if (info === 'End') {
      end = `${propsService.destination.location.lat},${propsService.destination.location.lng}`;
    } else {
      end = `${propsService.startPoint.location.lat},${propsService.startPoint.location.lng}`;
    }

    openMap({
      end,
      navigate_mode: 'navigate',
      provider: 'google',
    });
  };

  useEffect(() => {
    if (propsService.type === 'Amazon') {
      if (propsService.status === 'Pagado') {
        setProgress(0);
      }
      if (propsService.status === 'Amazon Enviando') {
        setProgress(1);
      }
      if (propsService.status === 'Paquete en Camino') {
        setProgress(2);
      }
      if (propsService.status === 'Completado') {
        setProgress(3);
      }
    } else {
      if (propsService.status === 'Pagado') {
        setProgress(0);
      }
      if (propsService.status === 'Recogiendo Paquete') {
        setProgress(1);
      }
      if (propsService.status === 'Enviando Paquete') {
        setProgress(2);
      }
      if (propsService.status === 'Completado') {
        setProgress(3);
      }
    }
  }, [propsService]);

  // eslint-disable-next-line consistent-return
  const changeStatusLocal = () => {
    const db = firebase.firestore();
    if (propsService.status === 'Pagado' && propsService.driverID === user.uid) {
      return (
        <ActionButton2
          style={{ left: '5%' }}
          onPress={() =>
            db
              .collection('Services')
              .doc(propsService.id)
              .update({ status: 'Recogiendo Paquete' })
              .then(async () => {
                Alert.alert(
                  'Recogiendo paquete',
                  'Vaya a la dirección  de comienzo para recoger el paquete',
                  [{ text: 'OK', onPress: () => navigate('ServiceList') }]
                );
              })
          }
        >
          Recogiendo Paquete
        </ActionButton2>
      );
    }
    if (propsService.status === 'Recogiendo Paquete' && propsService.driverID === user.uid) {
      return (
        <ActionButton2
          style={{ left: '5%' }}
          onPress={() =>
            db
              .collection('Services')
              .doc(propsService.id)
              .update({ status: 'Enviando Paquete' })
              .then(async () => {
                Alert.alert(
                  'Enviando Paquete',
                  'Vaya a la dirección  de destino para entregar el paquete',
                  [{ text: 'OK', onPress: () => navigate('ServiceList') }]
                );
              })
          }
        >
          Paquete en Camino
        </ActionButton2>
      );
    }
    if (propsService.status === 'Enviando Paquete' && propsService.driverID === user.uid) {
      return (
        <ActionButton2 style={{ left: '5%' }} onPress={() => toggleTakePhotoModal(true)}>
          Confirmar Entrega
        </ActionButton2>
      );
    }
    if (propsService.status === 'Completado') {
      return null;
    }
  };
  const savePhoto = async ({ imageBlob }) => {
    // Do not request access because this relies on the driver already gave access
    // in the Home screen
    const db = firebase.firestore();

    try {
      const imgRef = firebase.storage().ref().child(`service-images/${shortid.generate()}`);
      setUploadingImage(true);
      const task = imgRef.put(imageBlob);
      await task.on(
        'state_changed',
        () => {},
        () => {},
        () => {
          db.collection('Services')
            .doc(propsService.id)
            .update({ status: 'Completado', completedDate: new Date() })
            .then(async () => {
              Alert.alert('Entrega Confirmada', 'Gracias por confirmar en Passeio', [
                { text: 'OK', onPress: () => navigate('ServiceList') },
              ]);
            });
        }
      );
    } catch (err) {
      // setLoginError(err.message);
      Alert.alert(err.message);
    }
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
        <Title category="h5">Detalle de Servicio</Title>
      </View>
      <Divider />
      {propsService.type === 'Amazon' ? (
        <>
          <Card style={{ width: '80%', marginRight: 'auto', marginLeft: 'auto' }}>
            <View
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'row',
                width: '100%',
              }}
            >
              <View style={{ width: '50%', maxHeight: 80, overflow: 'hidden' }}>
                <Text style={{ fontWeight: '800', fontSize: 10 }}>Dirección Destino </Text>
                <Text>{propsService.destination.address} </Text>
              </View>
              <Button
                style={{ width: 50, height: 50, borderRadius: 50 }}
                onPress={() => openNavigationMap('End')}
                status="success"
              >
                <Icon
                  height={30}
                  width={30}
                  style={{ right: 10 }}
                  fill="white"
                  name="navigation-outline"
                />
              </Button>
            </View>
          </Card>
          <>
            <Row>
              <Icon
                style={{
                  width: 20,
                  height: 20,
                }}
                fill={progress >= 0 ? '#7FFF00' : '#2d3436'}
                name="flag"
              />
              <Status> Orden Confirmada </Status>
            </Row>
            <Row style={{ bottom: 20 }}>
              <Icon
                style={{
                  width: 20,
                  height: 20,
                }}
                fill={progress >= 1 ? '#7FFF00' : '#2d3436'}
                name="flag"
              />
              <Status> Paquete Comprado </Status>
            </Row>
            <Row style={{ bottom: 40 }}>
              <Icon
                style={{
                  width: 20,
                  height: 20,
                }}
                fill={progress >= 2 ? '#7FFF00' : '#2d3436'}
                name="flag"
              />
              <Status> Paquete en Camino </Status>
            </Row>
            <Row style={{ bottom: 60 }}>
              <Icon
                style={{
                  width: 20,
                  height: 20,
                }}
                fill={progress >= 3 ? '#7FFF00' : '#2d3436'}
                name="flag"
              />
              <Status> Paquete Entregado </Status>
            </Row>
            {loading === false ? <Map ref={mapRef} center={center} form={propsService} /> : null}
          </>

          {propsService.status === 'Paquete en Camino' && propsService.userID !== user.uid ? (
            <ActionButton onPress={() => toggleTakePhotoModal(true)}>
              Confirmar Entrega
            </ActionButton>
          ) : null}
          <ActionButton2
            onPress={() => navigate('Messages')}
            style={{ marginLeft: propsService.userID === user.uid ? 0 : 70 }}
          >
            {propsService.userID === user.uid ? 'Chat con viajero' : 'Chat'}
          </ActionButton2>
        </>
      ) : (
        <>
          <View
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <Card style={{ width: '80%', marginRight: 'auto', marginLeft: 'auto' }}>
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  width: '100%',
                }}
              >
                <View style={{ width: '70%', maxHeight: 80, overflow: 'hidden' }}>
                  <Text style={{ fontWeight: '800', fontSize: 10 }}>Dirección Comienzo </Text>
                  <Text>{propsService.startPoint.address} </Text>
                </View>
                <Button
                  style={{ width: 50, height: 50, borderRadius: 50 }}
                  onPress={() => openNavigationMap('Start')}
                  status="success"
                >
                  <Icon
                    height={30}
                    width={30}
                    style={{ right: 10 }}
                    fill="white"
                    name="navigation-outline"
                  />
                </Button>
              </View>
            </Card>
            <Card style={{ width: '80%', marginRight: 'auto', marginLeft: 'auto' }}>
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  width: '100%',
                }}
              >
                <View style={{ width: '70%', maxHeight: 80, overflow: 'hidden' }}>
                  <Text style={{ fontWeight: '800', fontSize: 10 }}>Dirección Destino </Text>
                  <Text>{propsService.destination.address} </Text>
                </View>
                <Button
                  style={{ width: 50, height: 50, borderRadius: 50 }}
                  onPress={() => openNavigationMap('End')}
                  status="success"
                >
                  <Icon
                    height={30}
                    width={30}
                    style={{ right: 10 }}
                    fill="white"
                    name="navigation-outline"
                  />
                </Button>
              </View>
            </Card>
          </View>
          <>
            <Row>
              <Icon
                style={{
                  width: 20,
                  height: 20,
                }}
                fill={progress >= 0 ? '#7FFF00' : '#2d3436'}
                name="flag"
              />
              <Status> Orden Confirmada </Status>
            </Row>
            <Row style={{ bottom: 20 }}>
              <Icon
                style={{
                  width: 20,
                  height: 20,
                }}
                fill={progress >= 1 ? '#7FFF00' : '#2d3436'}
                name="flag"
              />
              <Status> Recogiendo Paquete </Status>
            </Row>
            <Row style={{ bottom: 40 }}>
              <Icon
                style={{
                  width: 20,
                  height: 20,
                }}
                fill={progress >= 2 ? '#7FFF00' : '#2d3436'}
                name="flag"
              />
              <Status> Paquete en Camino </Status>
            </Row>
            <Row style={{ bottom: 60 }}>
              <Icon
                style={{
                  width: 20,
                  height: 20,
                }}
                fill={progress >= 3 ? '#7FFF00' : '#2d3436'}
                name="flag"
              />
              <Status> Paquete Entregado </Status>
            </Row>
            <View style={{ bottom: 60 }}>
              {loading === false ? <Map ref={mapRef} center={center} form={propsService} /> : null}
            </View>
          </>
          {propsService.driverID === user.uid ? changeStatusLocal() : null}
          <ActionButton2
            style={{ left: propsService.driverID === user.uid ? '60%' : null }}
            onPress={() => navigate('Messages')}
          >
            Chat{propsService.driverID === user.uid ? null : ' con Chofer'}
          </ActionButton2>
        </>
      )}
      <TakePhotoModal
        visible={isTakePhotoModalOpen}
        onClose={() => toggleTakePhotoModal(false)}
        onPhotoTaken={savePhoto}
        animationType="slide"
      />
    </Container>
  );
};

export default Done;
