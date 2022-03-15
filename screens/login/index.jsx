import React, { useState, useEffect } from 'react';
import { auth } from '@config/firebase';
import KeyboardAwareScroll from '@components/keyboard-aware-scroll';
import { StatusBar } from 'expo-status-bar';
import { TouchableWithoutFeedback, View, ImageBackground, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { emailPattern } from '@config/constants';
import { Icon, Button, Spinner, Text } from '@ui-kitten/components';
import { Content, Title, Subtitle, Input, SigninButton } from './elements';
import GIF from './login.gif';

const Login = () => {
  const { navigate } = useNavigation();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [submittedTry, setSubmittedTry] = useState(false);
  const [isEmailError, setIsEmailError] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [noUser, setNoUser] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(true);

  useEffect(() => {
    setIsEmailError(!emailPattern.test(form.email));
  }, [form.email]);

  useEffect(() => {
    setIsPasswordError(!form.password);
  }, [form.password]);

  const submit = async () => {
    if (isEmailError || isPasswordError) {
      setSubmittedTry(true);
      return;
    }

    setSubmitting(true);
    try {
      await auth().signInWithEmailAndPassword(form.email, form.password);
    } catch (err) {
      // setLoginError(err.message);
      Alert.alert(err.message);
      setNoUser(true);
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAwareScroll>
      <StatusBar style="auto" />

      <ImageBackground source={GIF} style={{ width: '100%', height: '100%' }}>
        <View style={{ top: '15%' }}>
          <Title category="h3" style={{ color: 'black' }}>
            Passeio
          </Title>
          <Subtitle category="h6" style={{ color: 'black' }}>
            Inicia sesión
          </Subtitle>
          <Content style={{ top: 80 }}>
            <Input
              size="large"
              autoCapitalize="none"
              autoCompleteType="email"
              value={form.email}
              placeholder="Ingresa tu correo electrónico"
              status={submittedTry && isEmailError && 'warning'}
              caption={submittedTry && isEmailError && 'Ingresa un correo electrónico válido'}
              captionIcon={(props) =>
                submittedTry && isEmailError && <Icon {...props} name="alert-circle-outline" />
              }
              accessoryLeft={(props) => <Icon {...props} name="person-outline" />}
              onChangeText={(nextValue) => setForm({ ...form, email: nextValue })}
            />
            <Input
              size="large"
              autoCapitalize="none"
              autoCompleteType="password"
              value={form.password}
              placeholder="Ingresa tu contraseña"
              status={((submittedTry && isPasswordError) || noUser) && 'warning'}
              caption={noUser && 'Usuario no encontrado. Verifica tus credenciales'}
              captionIcon={(props) => noUser && <Icon {...props} name="alert-circle-outline" />}
              accessoryRight={(props) => (
                <TouchableWithoutFeedback onPress={() => setSecureTextEntry(!secureTextEntry)}>
                  <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
                </TouchableWithoutFeedback>
              )}
              accessoryLeft={(props) => <Icon {...props} name="unlock-outline" />}
              secureTextEntry={secureTextEntry}
              onChangeText={(nextValue) => setForm({ ...form, password: nextValue })}
            />
            {loginError !== '' && (
              <Text
                style={{
                  color: 'red',
                  marginLeft: 'auto',
                  marginRight: 'auto',

                  padding: 10,
                }}
              >
                {loginError}
              </Text>
            )}
            <Button
              onPress={() => navigate('RecoverPassword')}
              appearance="ghost"
              size="tiny"
              style={{ top: '20%' }}
            >
              <Text style={{ color: 'white', fontWeigth: '800' }}>¿Olvidaste tu contraseña?</Text>
            </Button>
            <SigninButton
              style={{
                top: '20%',
                width: '85%',
                marginLeft: 'auto',
                marginRight: 'auto',
                backgroundColor: 'black',
              }}
              accessoryLeft={
                submitting
                  ? (props) => (
                      <View {...props}>
                        <Spinner size="small" />
                      </View>
                    )
                  : undefined
              }
              disabled={submitting}
              accessoryRight={(props) => <Icon {...props} name="arrowhead-right-outline" />}
              onPress={submit}
            >
              Iniciar Sesión
            </SigninButton>
            <Button onPress={() => navigate('Signup')} appearance="ghost" style={{ top: '20%' }}>
              <Text style={{ color: 'white', fontWeigth: '800', fontSize: 22 }}>
                ¿No tienes cuenta? Crea una.
              </Text>
            </Button>
          </Content>
        </View>
      </ImageBackground>
    </KeyboardAwareScroll>
  );
};

export default Login;
