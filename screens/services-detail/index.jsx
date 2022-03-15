import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-native';
import firebase from 'firebase';
import { useNavigation } from '@react-navigation/native';
import openMap from 'react-native-open-maps';
import shortid from 'shortid';
import { Icon, Divider } from '@ui-kitten/components';
// import { useNavigation } from '@react-navigation/native';
import TakePhotoModal from '../../templates/take-photo-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Container,
  Tag,
  Title,
  Row,
  Status,
  ActionButton,
  FloatingButton,
  ActionButton2,
} from './elements';
import { useAuth } from '@providers/auth';
import Map from './components/map';

const Done = ({
  route: {
    params: { service: propsService },
  },
}) => {
  // const { navigate } = useNavigation();
  const mapRef = useRef({});
  const { top } = useSafeAreaInsets();
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const [services, setServices] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setloading] = useState(false);

  const [isTakePhotoModalOpen, toggleTakePhotoModal] = useState(false);
  const [evidence, setEvidence] = useState(null);
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

  const openNavigationMap = () => {
    let end;

    // Add func to pick up package or deliver Package
    if (propsService.status === 'Enviando Paquete') {
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

  const changeStatusLocal = () => {
    const db = firebase.firestore();
    if (propsService.status === 'Pagado') {
      return (
        <ActionButton2
          style={{ left: '5%' }}
          onPress={() =>
            db
              .collection('Services')
              .doc(propsService.id)
              .update({ status: 'Recogiendo Paquete' })
              .then(async (docRef) => {
                Alert.alert(
                  'Recogiendo paquete',
                  'Vaya a la dirrecion de comienzo para recoger el paquete',
                  [{ text: 'OK', onPress: () => navigate('ServiceList') }]
                );
              })
          }
        >
          Recogiendo Paquete
        </ActionButton2>
      );
    }
    if (propsService.status === 'Recogiendo Paquete') {
      return (
        <ActionButton2
          style={{ left: '5%' }}
          onPress={() =>
            db
              .collection('Services')
              .doc(propsService.id)
              .update({ status: 'Enviando Paquete' })
              .then(async (docRef) => {
                Alert.alert(
                  'Enviando Paquete',
                  'Vaya a la dirrecion de destino para entregar el paquete',
                  [{ text: 'OK', onPress: () => navigate('ServiceList') }]
                );
              })
          }
        >
          Enviando Paquete
        </ActionButton2>
      );
    }
    if (propsService.status === 'Enviando Paquete') {
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
            .update({ status: 'Completado' })
            .then(async (docRef) => {
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
      <Title category="h5">Detalle de Servicio</Title>
      <Divider />
      {propsService.type === 'Amazon' ? (
        <>
          <>
            <Row>
              <Icon
                style={{
                  width: 32,
                  height: 32,
                }}
                fill={progress >= 0 ? '#7FFF00' : '#2d3436'}
                name="flag"
              />
              <Status> Orden Confirmada </Status>
            </Row>
            <Row>
              <Icon
                style={{
                  width: 32,
                  height: 32,
                }}
                fill={progress >= 1 ? '#7FFF00' : '#2d3436'}
                name="flag"
              />
              <Status> Amazon Lo esta enviando </Status>
            </Row>
            <Row>
              <Icon
                style={{
                  width: 32,
                  height: 32,
                }}
                fill={progress >= 2 ? '#7FFF00' : '#2d3436'}
                name="flag"
              />
              <Status> Paquete en Camino </Status>
            </Row>
            <Row>
              <Icon
                style={{
                  width: 32,
                  height: 32,
                }}
                fill={progress >= 3 ? '#7FFF00' : '#2d3436'}
                name="flag"
              />
              <Status> Paquete Entregado </Status>
            </Row>
            {loading === false ? (
              <Map ref={mapRef} services={services} center={center} form={propsService} />
            ) : null}
          </>

          {propsService.status === 'Paquete en Camino' ? (
            <ActionButton onPress={() => toggleTakePhotoModal(true)}>
              Confirmar Entrega
            </ActionButton>
          ) : null}
          <ActionButton2
            onPress={() => navigate('Messages')}
            style={{ marginLeft: propsService.userID === user.uid ? 0 : 70 }}
          >
            {propsService.userID === user.uid ? 'Chat con chofer' : 'Chat'}
          </ActionButton2>
          <FloatingButton
            onPress={openNavigationMap}
            status="success"
            accessoryLeft={(props) => <Icon {...props} name="navigation-outline" />}
          />
        </>
      ) : (
        <>
          <>
            <Row>
              <Icon
                style={{
                  width: 32,
                  height: 32,
                }}
                fill={progress >= 0 ? '#7FFF00' : '#2d3436'}
                name="flag"
              />
              <Status> Orden Confirmada </Status>
            </Row>
            <Row>
              <Icon
                style={{
                  width: 32,
                  height: 32,
                }}
                fill={progress >= 1 ? '#7FFF00' : '#2d3436'}
                name="flag"
              />
              <Status> Recogiendo Paquete </Status>
            </Row>
            <Row>
              <Icon
                style={{
                  width: 32,
                  height: 32,
                }}
                fill={progress >= 2 ? '#7FFF00' : '#2d3436'}
                name="flag"
              />
              <Status> Enviando Paquete </Status>
            </Row>
            <Row>
              <Icon
                style={{
                  width: 32,
                  height: 32,
                }}
                fill={progress >= 3 ? '#7FFF00' : '#2d3436'}
                name="flag"
              />
              <Status> Paquete Entregado </Status>
            </Row>
            {loading === false ? (
              <Map ref={mapRef} services={services} center={center} form={propsService} />
            ) : null}
          </>
          {propsService.driverID === user.uid ? changeStatusLocal() : null}
          <ActionButton2
            style={{ left: propsService.driverID === user.uid ? '60%' : null }}
            onPress={() => navigate('Messages')}
          >
            Chat{propsService.driverID === user.uid ? null : ' con Chofer'}
          </ActionButton2>
          <FloatingButton
            onPress={openNavigationMap}
            status="success"
            accessoryLeft={(props) => <Icon {...props} name="navigation-outline" />}
          >
            Dirrecion {propsService.status === 'Enviando Paquete' ? 'Destino' : 'Comienzo'}
          </FloatingButton>
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
