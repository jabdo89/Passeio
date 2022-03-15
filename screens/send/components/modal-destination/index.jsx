import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { Button, Text } from '@ui-kitten/components';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import BottomModal from '../../../../templates/bottom-modal';
import { Title } from './elements';

const BoolModal = ({ visible, onClose, setDestination, submit }) => {
  const ref = useRef();
  const [country, setCountry] = useState('');
  const save = () => {
    submit();
    onClose();
  };

  const getCountry = (data) => {
    for (let i = 0; i < data.address_components.length; i++) {
      if (data.address_components[i].types.includes('country')) {
        return data.address_components[i].long_name;
      }
    }
  };

  return (
    <BottomModal visible={visible} onClose={onClose} style={{ minHeight: 700, display: 'flex' }}>
      <View style={{ minHeight: 300 }}>
        <Title category="h6">Pais de Destino :</Title>
        <Text>{country}</Text>
        <GooglePlacesAutocomplete
          ref={ref}
          placeholder="Buscar país..."
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
            setCountry(getCountry(details));
            setDestination({
              address: data.description,
              placeId: data.place_id,
              location: details.geometry.location,
              country: getCountry(details),
            });
          }}
          query={{
            key: 'AIzaSyCcdE49CrgHx3DZeqx3gmXg7VVwjrzNE7k',
            language: 'en',
          }}
        />
        <Button onPress={save} disabled={country === ''}>
          Confirmar Pedido
        </Button>
      </View>
    </BottomModal>
  );
};

export default BoolModal;
