import React, { useState } from 'react';
import {
  Button,
  Input,
  Select,
  SelectItem,
  IndexPath,
  Text,
  RadioGroup,
  Radio,
  Icon,
  Spinner,
} from '@ui-kitten/components';
import { View } from 'react-native';
import firebase from 'firebase';
import { useAuth } from '@providers/auth';
import CreditCard from 'react-native-credit-card-v2';
import BottomModal from '../../../../templates/bottom-modal';
import { Title, Row } from './elements';

const BoolModal = ({ visible, onClose }) => {
  const [value, setValue] = useState({ price: '', weigth: '', category: '' });
  const { user } = useAuth();

  const [creditCard, setCreditCard] = useState({
    number: '',
    cvc: '',
    expiry: '',
    type: '',
    name: '',
  });
  const [cardError, setCardError] = useState(null);
  const [checking, setChecking] = useState(false);
  const [submittedTry, setSubmittedTry] = useState(false);
  const [isEmailError, setIsEmailError] = useState(true);

  const save = async () => {
    const functions = firebase.functions();
    console.log('chck');
    const pdf = functions.httpsCallable('addPaymentMethod');
    setChecking(true);
    const bit = await pdf({ card: creditCard, customer: user });
    setChecking(false);
    if (bit.data.status === 'Success') {
      await firebase
        .firestore()
        .collection('Users')
        .doc(user.uid)
        .collection('payment_methods')
        .add({ ...bit.data.result });
      setCardError(null);
      setCreditCard({
        number: '',
        cvc: '',
        expiry: '',
        type: '',
        name: '',
      });
      onClose();
    } else {
      setCardError(bit.data.result.raw.message);
      console.log(bit.data.result.raw.message);
    }
  };
  const expiryFormatter = (nextValue) => {
    const data = nextValue;
    setCreditCard({
      ...creditCard,
      expiry: data
        .replace(
          /[^0-9]/g,
          '' // To allow only numbers
        )
        .replace(
          /^([2-9])$/g,
          '0$1' // To handle 3 > 03
        )
        .replace(
          /^(1{1})([3-9]{1})$/g,
          '0$1/$2' // 13 > 01/3
        )
        .replace(
          /^0{1,}/g,
          '0' // To handle 00 > 0
        )
        .replace(
          /^([0-1]{1}[0-9]{1})([0-9]{1,2}).*/g,
          '$1/$2' // To handle 113 > 11/3
        ),
    });
  };

  return (
    <BottomModal
      visible={visible}
      onClose={onClose}
      style={{ minHeight: 400, backgroundColor: 'red' }}
    >
      <Title category="h6">Llene la de su Tarjeta de Credito/Debito</Title>
      <CreditCard
        style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: 10 }}
        type={creditCard.type}
        imageFront={require('../../images/card-front.png')}
        imageBack={require('../../images/card-back.png')}
        shiny={false}
        bar={false}
        focused="number"
        number={creditCard.number}
        name={creditCard.name}
        expiry={creditCard.expiry}
        cvc={creditCard.cvc}
      />
      {checking ? (
        <View style={{ top: 5 }}>
          <View
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: 20,
            }}
          >
            <Spinner size="giant" />
          </View>
          <Text style={{ fontSize: 15, textAlign: 'center' }}>Validando Tarjeta</Text>
        </View>
      ) : (
        <>
          {cardError ? (
            <Text style={{ color: 'red', marginLeft: 'auto', marginRight: 'auto' }}>
              {cardError}
            </Text>
          ) : null}
          <Input
            size="large"
            autoCapitalize="none"
            value={creditCard.name}
            label="Nombre"
            placeholder="Cual es el nombre en la tarjeta?"
            caption={submittedTry && isEmailError && 'Ingresa un correo electrónico válido'}
            captionIcon={(props) =>
              submittedTry && isEmailError && <Icon {...props} name="alert-circle-outline" />
            }
            status={submittedTry && isEmailError && 'warning'}
            accessoryLeft={(props) => <Icon {...props} name="layers-outline" />}
            onChangeText={(nextValue) => setCreditCard({ ...creditCard, name: nextValue })}
          />
          <Row>
            <Input
              style={{ width: 160 }}
              size="large"
              autoCapitalize="none"
              value={creditCard.cvc}
              label="CVC"
              placeholder="Cual es el codigo de seguridad?"
              caption={submittedTry && isEmailError && 'Ingresa un correo electrónico válido'}
              captionIcon={(props) =>
                submittedTry && isEmailError && <Icon {...props} name="alert-circle-outline" />
              }
              status={submittedTry && isEmailError && 'warning'}
              accessoryLeft={(props) => <Icon {...props} name="layers-outline" />}
              onChangeText={(nextValue) => setCreditCard({ ...creditCard, cvc: nextValue })}
            />
            <Input
              style={{ width: 160 }}
              size="large"
              autoCapitalize="none"
              value={creditCard.expiry}
              label="Expiry Date"
              placeholder="Cual es el fecha de caducidad"
              caption={submittedTry && isEmailError && 'Ingresa un correo electrónico válido'}
              captionIcon={(props) =>
                submittedTry && isEmailError && <Icon {...props} name="alert-circle-outline" />
              }
              status={submittedTry && isEmailError && 'warning'}
              accessoryLeft={(props) => <Icon {...props} name="layers-outline" />}
              onChangeText={(nextValue) => expiryFormatter(nextValue)}
            />
          </Row>
          <Input
            size="large"
            autoCapitalize="none"
            value={creditCard.number}
            label="Numero "
            placeholder="Cual es el numero de la tarjeta?"
            caption={submittedTry && isEmailError && 'Ingresa un correo electrónico válido'}
            captionIcon={(props) =>
              submittedTry && isEmailError && <Icon {...props} name="alert-circle-outline" />
            }
            status={submittedTry && isEmailError && 'warning'}
            accessoryLeft={(props) => <Icon {...props} name="layers-outline" />}
            onChangeText={(nextValue) => setCreditCard({ ...creditCard, number: nextValue })}
          />
          <Button style={{ marginTop: 20 }} onPress={save}>
            Agregar
          </Button>
        </>
      )}
    </BottomModal>
  );
};

export default BoolModal;
