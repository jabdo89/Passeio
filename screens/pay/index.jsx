import React, { useEffect, useState, useRef } from 'react';
import moment from 'moment';
import firebase from 'firebase';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import CreditCard from 'react-native-credit-card-v2';
import PropTypes from 'prop-types';
import { Icon, Input } from '@ui-kitten/components';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Container, Tag, Title, Row, SigninButton, Content } from './elements';

const Pay = ({
  route: {
    params: { service: propsService },
  },
}) => {
  const { top } = useSafeAreaInsets();
  const { navigate } = useNavigation();
  const [services, setServices] = useState([]);

  const [creditCard, setCreditCard] = useState({
    number: '',
    cvc: '',
    expiry: '',
    type: '',
    name: '',
  });

  const [submittedTry, setSubmittedTry] = useState(false);
  const [isEmailError, setIsEmailError] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    console.log(propsService.id);
    // setSubmitting(true);
    // setSubmittedTry(true);
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;
    console.log(propsService.id);
    db.collection('Services')
      .doc(propsService.id)
      .update({ status: 'Pagado' })
      .then(async (docRef) => {
        setSubmitting(false);
        Alert.alert('Entrega Pagada', 'Todo listo para comenzar la entrega', [
          { text: 'OK', onPress: () => navigate('ServiceList') },
        ]);
      });

    // setSubmitting(false);
    // setSubmittedTry(false);
  };

  return (
    <Container pt={top}>
      <Title category="h5">Pagar Servicio</Title>
      <Content>
        <CreditCard
          style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: 20 }}
          type={creditCard.type}
          imageFront={require('./images/card-front.png')}
          imageBack={require('./images/card-back.png')}
          shiny={false}
          bar={false}
          focused="number"
          number={creditCard.number}
          name={creditCard.name}
          expiry={creditCard.expiry}
          cvc={creditCard.cvc}
        />
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
            onChangeText={(nextValue) => setCreditCard({ ...creditCard, expiry: nextValue })}
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
        <SigninButton disabled={submitting} onPress={submit}>
          Pagar
        </SigninButton>
      </Content>
    </Container>
  );
};

Pay.defaultProps = {
  services: null,
};

Pay.propTypes = {
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

export default Pay;
