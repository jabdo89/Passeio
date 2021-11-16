import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigation } from '@react-navigation/native';
import openMap from 'react-native-open-maps';
import { Text, Icon, Divider } from '@ui-kitten/components';
// import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Container, Tag, Title, Row, Status, ActionButton, FloatingButton } from './elements';
import Map from './components/map';

const Done = ({
  route: {
    params: { service: propsService },
  },
}) => {
  // const { navigate } = useNavigation();
  const mapRef = useRef({});
  const { top } = useSafeAreaInsets();
  const { navigate } = useNavigation();
  const [services, setServices] = useState([]);
  const [loading, setloading] = useState(false);

  // Map Center
  const center = () => {
    const elements = [];
    if (propsService.startPoint) {
      elements.push(propsService.startPoint.address);
    }
    elements.push(propsService.destination.address);

    mapRef.current.fitToSuppliedMarkers([...elements], {
      edgePadding: { top: 30, right: 30, bottom: 30, left: 30 },
      animated: true,
    });
  };

  const openNavigationMap = () => {
    let end;

    // Add func to pick up package or deliver Package
    if (true) {
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
                fill="#7FFF00"
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
                fill="#2d3436"
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
                fill="#2d3436"
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
                fill="#2d3436"
                name="flag"
              />
              <Status> Paquete Entregado </Status>
            </Row>
            {loading === false ? (
              <Map ref={mapRef} services={services} center={center} form={propsService} />
            ) : null}
          </>
          <ActionButton onPress={() => console.log('hehe')}>Imprime Sello</ActionButton>
          <ActionButton onPress={() => navigate('Messages', { service: propsService })}>
            Chat con Chofer
          </ActionButton>
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
                fill="#7FFF00"
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
                fill="#2d3436"
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
                fill="#2d3436"
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
                fill="#2d3436"
                name="flag"
              />
              <Status> Paquete Entregado </Status>
            </Row>
            {loading === false ? (
              <Map ref={mapRef} services={services} center={center} form={propsService} />
            ) : null}
          </>
          <ActionButton onPress={() => console.log('hehe')}>Imprime Sello</ActionButton>
          <ActionButton onPress={() => navigate('Messages', { service: propsService })}>
            Chat con Chofer
          </ActionButton>
          <FloatingButton
            onPress={openNavigationMap}
            status="success"
            accessoryLeft={(props) => <Icon {...props} name="navigation-outline" />}
          />
        </>
      )}
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
