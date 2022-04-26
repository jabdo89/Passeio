/* eslint-disable react/prop-types */
import React, { forwardRef, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { Alert } from 'react-native';
import { useTheme } from '@ui-kitten/components';
import { CustomMarker, MarkerText, BackgroundMap } from './elements';

const Map = forwardRef(({ services, selected, center, form }, ref) => {
  const theme = useTheme();
  const [mapReady, setMapReady] = useState(false);
  const [firstCenterDone, setFirstCenterDone] = useState(false);
  const [currentCoordinate, setCurrentCoordinate] = useState(null);

  useEffect(() => {
    const geolocate = async () => {
      const { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') Alert.alert('Permission to access location was denied');

      const {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync({});
      setCurrentCoordinate({
        latitude,
        longitude,
      });
    };

    geolocate();
  }, []);

  useEffect(() => {
    // Only autocenter first time
    if (mapReady && !firstCenterDone) {
      center();
      setFirstCenterDone(false);
    }
  }, [mapReady, currentCoordinate, selected]);

  return (
    <BackgroundMap onMapReady={() => setMapReady(true)} ref={ref} provider={PROVIDER_GOOGLE}>
      {currentCoordinate && (
        <Marker
          pinColor={theme['color-primary-600']}
          identifier="user"
          coordinate={currentCoordinate}
        />
      )}
      <Marker
        key={form.startPoint.address}
        identifier={form.startPoint.address}
        pinColor={theme['color-success-600']}
        coordinate={{
          latitude: form.startPoint.location.lat,
          longitude: form.startPoint.location.lng,
        }}
      >
        <CustomMarker>
          <MarkerText category="h6">S</MarkerText>
        </CustomMarker>
      </Marker>
      <Marker
        key={form.destination.address}
        identifier={form.destination.address}
        pinColor={theme['color-success-600']}
        coordinate={{
          latitude: form.destination.location.lat,
          longitude: form.destination.location.lng,
        }}
      >
        <CustomMarker>
          <MarkerText category="h6">E</MarkerText>
        </CustomMarker>
      </Marker>
      {services.map(({ destination, startPoint }, index) => (
        <>
          <Marker
            key={destination.address}
            identifier={destination.address}
            pinColor={theme['color-warning-100']}
            coordinate={{ latitude: destination.location.lat, longitude: destination.location.lng }}
          >
            <CustomMarker current>
              <MarkerText current category="h6">
                {index + 1}
              </MarkerText>
            </CustomMarker>
          </Marker>
          <Marker
            key={startPoint.address}
            identifier={startPoint.address}
            pinColor={theme['color-warning-100']}
            coordinate={{ latitude: startPoint.location.lat, longitude: startPoint.location.lng }}
          >
            <CustomMarker current>
              <MarkerText current category="h6">
                {index + 1}
              </MarkerText>
            </CustomMarker>
          </Marker>
        </>
      ))}
      <Polyline
        coordinates={[
          { latitude: form.startPoint.location.lat, longitude: form.startPoint.location.lng },
          { latitude: form.destination.location.lat, longitude: form.destination.location.lng },
        ]}
        strokeColor={theme['color-primary-400']}
        strokeWidth={3}
      />
    </BackgroundMap>
  );
});

export default Map;
