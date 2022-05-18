import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import firebase from 'firebase';
import { Rating } from 'react-native-ratings';
import { useAuth } from '@providers/auth';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Alert, ScrollView, Linking, Platform } from 'react-native';
import { Avatar, Text, Divider, Icon, Button, Card, Modal, useTheme } from '@ui-kitten/components';
import { Container, Content, Row, OptionText, AvatarSection, TextSection, Input } from './elements';

const Options = () => {
  const { top } = useSafeAreaInsets();
  const [exitModal, toggleExitModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [changingPhone, setChangingPhone] = useState(false);
  const [withdraw, setWithdraw] = useState(false);
  const theme = useTheme();

  const { user } = useAuth();

  const call = async (info) => {
    let number = info;

    if (Platform.OS !== 'android') number = `telprompt:${number}`;
    else number = `tel:${number}`;

    const supported = await Linking.canOpenURL(number);

    if (!supported) Alert.alert('Phone number is not available');
    else await Linking.openURL(number);
  };

  const submitPhone = async () => {
    const db = firebase.firestore();
    db.collection('Users')
      .doc(user.uid)
      .update({
        phone,
      })
      .then(() => {
        setChangingPhone(false);
        Alert.alert('Cambio de teléfono', 'Cambiaste tu teléfono con éxito');
      });
  };

  const retirar = async () => {
    const db = firebase.firestore();
    db.collection('Withdraws')
      .add({
        driverID: user.uid,
        quantity: user.credit,
        date: new Date(),
      })
      .then(() => {
        setWithdraw(true);
        db.collection('Users').doc(user.uid).update({
          retirando: true,
        });
        Alert.alert(
          'Contacte a Soporte',
          'Soporte se encargara de mandarle su dinero de la forma mas comoda para usted'
        );
      });
  };

  return (
    <>
      <Container pt={top}>
        <StatusBar style="auto" />
        <AvatarSection>
          <Avatar
            size="giant"
            source={{
              uri:
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgA1uaZBxqEjCa0JW4PR3LnWKfRJMDCdVivg&usqp=CAU',
            }}
          />
          <TextSection>
            <Text category="c2">Bienvenido</Text>
            <Text category="h6">
              {user.firstName} {user.lastName}
            </Text>
          </TextSection>
        </AvatarSection>
        <ScrollView>
          <Card>
            <Text style={{ fontWeight: '800', fontSize: 13 }}>Crédito Passeio</Text>
            <Row style={{ justifyContent: 'space-between' }}>
              <Card
                style={{
                  maxWidth: '50%',
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: '800' }}>${user.credit.toFixed(2)}</Text>
              </Card>
              <Card
                style={{
                  maxWidth: '50%',
                }}
              >
                <Rating
                  type="star"
                  ratingCount={5}
                  startingValue={user.rating ? user.rating : 5}
                  imageSize={30}
                  readonly
                />
              </Card>
            </Row>
            <Button disabled={user.retirando || withdraw} onPress={() => retirar()}>
              Retirar Ganancias
            </Button>
          </Card>
          {!changingPhone && (
            <Card style={{ marginTop: 20, marginBottom: 20 }}>
              <Text style={{ fontWeight: '800', fontSize: 13 }}> Acciones</Text>
              <Button
                style={{
                  width: '100%',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
                status="primary"
                appearance="ghost"
                onPress={() => setChangingPhone(true)}
              >
                <Row style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text style={{ fontWeight: '500' }}>Cambio de Teléfono</Text>
                  <Icon height={32} width={32} fill={theme['color-primary-600']} name="phone" />
                </Row>
              </Button>
              <Divider />
              <Button
                style={{
                  width: '100%',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
                status="primary"
                appearance="ghost"
                onPress={() => call(7702961922)}
              >
                <Row style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text style={{ fontWeight: '500' }}>Marcar a Soporte</Text>
                  <Icon
                    height={32}
                    width={32}
                    fill={theme['color-primary-600']}
                    name="phone-call"
                  />
                </Row>
              </Button>
              <Divider />
              <Button
                style={{
                  width: '100%',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
                status="primary"
                appearance="ghost"
                onPress={() => {
                  Linking.openURL('https://www.passeioapp.com/terms?lang=en');
                }}
              >
                <Row style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text style={{ fontWeight: '500' }}>Terminos y Condiciones</Text>
                  <Icon height={32} width={32} fill={theme['color-primary-600']} name="bookmark" />
                </Row>
              </Button>
            </Card>
          )}
          {changingPhone && (
            <>
              <Input
                size="large"
                autoCapitalize="none"
                value={phone}
                style={{ marginTop: 30 }}
                label="Nuevo Telefono"
                keyboardType="numeric"
                placeholder="Telefono"
                accessoryLeft={(props) => <Icon {...props} name="pricetags-outline" />}
                onChangeText={(nextValue) => setPhone(nextValue)}
              />
              <Button
                style={{ marginTop: 20, width: '80%', marginLeft: 'auto', marginRight: 'auto' }}
                onPress={() => submitPhone()}
              >
                Cambiar Telefono
              </Button>
              <Button
                style={{ width: '80%', marginLeft: 'auto', marginRight: 'auto' }}
                appearance="ghost"
                onPress={() => setChangingPhone(false)}
              >
                <Text style={{ color: 'red' }}>Cancelar</Text>
              </Button>
            </>
          )}

          <Content>
            <TouchableOpacity onPress={() => toggleExitModal(true)}>
              <Row style={{ marginTop: 10 }}>
                <OptionText>Cerrar Sesión</OptionText>
                <Icon
                  height={32}
                  width={32}
                  fill={theme['color-danger-600']}
                  name="log-out-outline"
                />
              </Row>
            </TouchableOpacity>
            <Divider />
          </Content>
        </ScrollView>
      </Container>

      <Modal visible={exitModal}>
        <Card disabled>
          <Text>¿Estás seguro que deseas salir?</Text>
          <Button
            style={{ marginTop: 10 }}
            status="danger"
            appearance="outline"
            onPress={() => firebase.auth().signOut()}
          >
            Sí, salir.
          </Button>
          <Button style={{ marginTop: 10 }} onPress={() => toggleExitModal(false)}>
            No, quedarme.
          </Button>
        </Card>
      </Modal>
    </>
  );
};

export default Options;
