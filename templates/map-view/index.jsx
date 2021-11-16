import React, { forwardRef } from 'react';
import Map from 'react-native-maps';
import { useTheme } from '@ui-kitten/components';

const MapView = forwardRef(({ ...props }, ref) => {
  const theme = useTheme();
  return (
    <Map
      ref={ref}
      initialRegion={{
        latitude: 25.651434, // Default Lat for Tec de Monterrey,
        longitude: -100.2938946, // Default Lng for Tec de Monterrey
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      customMapStyle={[
        {
          stylers: [
            {
              hue: theme['color-primary-default'],
            },
          ],
        },
        {
          featureType: 'water',
          stylers: [
            {
              color: theme['background-basic-color-1'],
            },
          ],
        },
      ]}
      {...props}
    />
  );
});

export default MapView;
