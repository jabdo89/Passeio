import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import firebase from 'firebase';
import KeyboardAwareScroll from '@components/keyboard-aware-scroll';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@providers/auth';
import { Divider, Select, SelectItem, IndexPath, Button, Spinner } from '@ui-kitten/components';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Modal from './components/modal';
import { Container, Title, SigninButton, Content } from './elements';

const Pay = ({
  route: {
    params: { service: propsService },
  },
}) => {
  const { top } = useSafeAreaInsets();
  const { navigate } = useNavigation();
  const [isModalOpen, toggleModal] = useState(false);
  const { user } = useAuth();

  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [paymentMethodIndex, setPaymentMethodIndex] = useState(new IndexPath(0));
  const [paymentMethods, setPaymentMethods] = useState([]);
  useEffect(() => {
    const db = firebase.firestore();

    const query = async () => {
      db.collection('Users')
        .doc(user.uid)
        .collection('payment_methods')
        .onSnapshot((querySnapshot) => {
          const info = [];
          // eslint-disable-next-line func-names
          querySnapshot.forEach((doc) => {
            info.push(doc.data());
          });
          setPaymentMethods(info);
        });
    };

    query();
  }, []);

  const submit = async () => {
    const db = firebase.firestore();
    const functions = firebase.functions();
    const pdf = functions.httpsCallable('chargeStripe');
    setChecking(true);
    const bit = await pdf({
      user,
      source: paymentMethods[paymentMethodIndex.row],
      info: propsService,
    });
    setChecking(false);
    if (bit.data.status === 'Success') {
      db.collection('Services')
        .doc(propsService.id)
        .update({ status: 'Pagado', payed: true })
        .then(async (docRef) => {
          setSubmitting(false);
          Alert.alert('Entrega Pagada', 'Todo listo para comenzar la entrega', [
            { text: 'OK', onPress: () => navigate('ServiceList') },
          ]);
        });
    } else {
      console.log(bit);
    }
  };

  return (
    <Container pt={top}>
      <Title category="h5">Pagar Servicio</Title>
      <KeyboardAwareScroll>
        <Content>
          <View
            style={{
              width: '80%',
              heigth: 400,
              marginBottom: 10,
              borderRadius: 20,
              borderColor: 'black',
              borderWidth: 0.5,
              padding: 20,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {propsService.type === 'Amazon' ? (
              <>
                <Text>Precio de Productos: ${propsService.total.products} USD</Text>
                <Text>Envio: ${propsService.total.delivery} USD</Text>
                <Text style={{ marginBottom: 10 }}>Tarifa: ${propsService.total.fee} USD</Text>
                <Divider />
                <Text style={{ marginTop: 10, fontWeight: '700' }}>
                  Total: ${propsService.total.total} USD
                </Text>
              </>
            ) : (
              <>
                <Text>Envio: ${propsService.total.total} USD</Text>
                <Divider />
                <Text style={{ marginTop: 10, fontWeight: '700' }}>
                  Total: ${propsService.total.total} USD
                </Text>
              </>
            )}
          </View>
          <Text style={{ fontSize: 18, marginBottom: 20, fontWeight: '600' }}>
            Selecione su metodo de Pago
          </Text>
          {paymentMethods.length === 0 ? null : (
            <Select
              size="large"
              value={`**** **** **** ${
                paymentMethods[paymentMethodIndex.row].card.last4
              }   ${paymentMethods[paymentMethodIndex.row].card.brand.toUpperCase()}`}
              selectedIndex={paymentMethodIndex}
              onSelect={(index) => setPaymentMethodIndex(index)}
            >
              {paymentMethods.map((category) => {
                const cardType = category.card.brand.toUpperCase();
                return <SelectItem title={`**** **** **** ${category.card.last4}   ${cardType}`} />;
              })}
            </Select>
          )}
          {checking ? (
            <View style={{ top: 50 }}>
              <View
                style={{
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  marginBottom: 20,
                }}
              >
                <Spinner size="giant" />
              </View>
              <Text style={{ fontSize: 15, textAlign: 'center' }}>Procesando Pago</Text>
            </View>
          ) : (
            <>
              <Button
                style={{ width: '70%', marginLeft: 'auto', marginRight: 'auto', marginTop: 20 }}
                appearance="outline"
                onPress={() => toggleModal(true)}
              >
                + Nuevo Metodo de Pago
              </Button>

              <SigninButton disabled={false} onPress={() => submit()}>
                Pagar
              </SigninButton>
            </>
          )}
        </Content>
        <Modal visible={isModalOpen} onClose={() => toggleModal(false)} />
      </KeyboardAwareScroll>
    </Container>
  );
};

export default Pay;
