import React, { useState, useEffect } from 'react';
import { auth, db } from '@config/firebase';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { emailPattern } from '@config/constants';
import KeyboardAwareScroll from '@components/keyboard-aware-scroll';
import { Icon, Button, Spinner } from '@ui-kitten/components';
import { Content, Header, Title, Subtitle, Input, SigninButton } from './elements';

const Signup = () => {
  const { top } = useSafeAreaInsets();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [submittedTry, setSubmittedTry] = useState(false);
  const [isEmailError, setIsEmailError] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [noPasswordError, setNoPasswordError] = useState(true);
  const [differentPasswordsError, setDifferentPasswordsError] = useState(true);
  const { navigate } = useNavigation();

  useEffect(() => {
    setIsEmailError(!emailPattern.test(form.email));
  }, [form.email]);

  useEffect(() => {
    setNoPasswordError(!form.password);
  }, [form.password]);

  useEffect(() => {
    setDifferentPasswordsError(form.password !== form.confirmPassword);
  }, [form.confirmPassword, form.password]);

  const submit = async () => {
    if (isEmailError || noPasswordError || differentPasswordsError) {
      setSubmittedTry(true);
      return;
    }
    if (isEmailError || noPasswordError || differentPasswordsError) {
      setSubmittedTry(true);
      return;
    }
    setSubmitting(true);
    const newUser = { ...form };
    delete newUser.confirmPassword;

    const snapshot = await db().collection('Users').where('email', '==', newUser.email).get();
    let user = null;
    if (snapshot.empty) {
      try {
        const { user: data } = await auth().createUserWithEmailAndPassword(
          newUser.email,
          newUser.password
        );
        user = data;
      } catch (err) {
        // setLoginError(err.message);
        Alert.alert(err.message);
        setSubmitting(false);
      }

      db().collection('Users').doc(user.uid).set({
        email: newUser.email,
        uid: user.uid,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        credit: 0,
        aproved: false,
        rating: 5,
      });
    } else {
      Alert.alert('Usuario ya existe');
    }
  };

  return (
    <KeyboardAwareScroll>
      <StatusBar style="auto" />
      <Header pt={top} level="2">
        <Title category="h3">¿No tienes cuenta?</Title>
        <Subtitle category="h6">Crea una</Subtitle>
      </Header>
      <Content>
        <Input
          size="large"
          autoCapitalize="none"
          value={form.email}
          autoCompleteType="email"
          label="Correo"
          placeholder="Ingresa tu correo electrónico"
          caption={submittedTry && isEmailError && 'Ingresa un correo electrónico válido'}
          captionIcon={(props) =>
            submittedTry && isEmailError && <Icon {...props} name="alert-circle-outline" />
          }
          status={submittedTry && isEmailError && 'warning'}
          accessoryLeft={(props) => <Icon {...props} name="person-outline" />}
          onChangeText={(nextValue) => setForm({ ...form, email: nextValue })}
        />
        <Input
          size="large"
          autoCapitalize="words"
          autoCompleteType="name"
          value={form.firstName}
          label="Nombre"
          placeholder="Ingresa tu nombre"
          caption={submittedTry && !form.firstName && 'Ingresa un nombre válido'}
          status={submittedTry && !form.firstName && 'warning'}
          captionIcon={(props) =>
            submittedTry && !form.firstName && <Icon {...props} name="alert-circle-outline" />
          }
          accessoryLeft={(props) => <Icon {...props} name="menu-outline" />}
          onChangeText={(nextValue) => setForm({ ...form, firstName: nextValue })}
        />
        <Input
          size="large"
          autoCapitalize="words"
          autoCompleteType="name"
          value={form.lastName}
          label="Apellidos"
          placeholder="Ingresa tu apellido"
          caption={submittedTry && !form.lastName && 'Ingresa un apellido válido'}
          status={submittedTry && !form.lastName && 'warning'}
          captionIcon={(props) =>
            submittedTry && !form.lastName && <Icon {...props} name="alert-circle-outline" />
          }
          accessoryLeft={(props) => <Icon {...props} name="menu-outline" />}
          onChangeText={(nextValue) => setForm({ ...form, lastName: nextValue })}
        />
        <Input
          size="large"
          autoCapitalize="words"
          autoCompleteType="name"
          value={form.phone}
          label="Telefono"
          placeholder="Ingresa tu Telefono"
          caption={submittedTry && form.phone === '' && 'Ingresa un telefono válido'}
          status={submittedTry && form.phone === '' && 'warning'}
          captionIcon={(props) =>
            submittedTry && form.phone === '' && <Icon {...props} name="alert-circle-outline" />
          }
          accessoryLeft={(props) => <Icon {...props} name="menu-outline" />}
          onChangeText={(nextValue) => setForm({ ...form, phone: nextValue })}
        />
        <Input
          size="large"
          autoCapitalize="none"
          autoCompleteType="password"
          value={form.password}
          label="Contraseña"
          secureTextEntry
          placeholder="Ingresa tu contraseña"
          status={submittedTry && noPasswordError && 'warning'}
          caption={submittedTry && noPasswordError && 'Se requiere contraseña'}
          captionIcon={(props) =>
            submittedTry && noPasswordError && <Icon {...props} name="alert-circle-outline" />
          }
          accessoryLeft={(props) => <Icon {...props} name="unlock-outline" />}
          onChangeText={(nextValue) => setForm({ ...form, password: nextValue })}
        />
        <Input
          size="large"
          autoCapitalize="none"
          autoCompleteType="password"
          value={form.confirmPassword}
          secureTextEntry
          label="Confirmar contraseña"
          placeholder="Repite tu contraseña"
          status={submittedTry && differentPasswordsError && 'danger'}
          caption={submittedTry && differentPasswordsError && 'Las contraseñas no coinciden'}
          captionIcon={(props) =>
            submittedTry &&
            differentPasswordsError && <Icon {...props} name="alert-circle-outline" />
          }
          accessoryLeft={(props) => <Icon {...props} name="unlock-outline" />}
          onChangeText={(nextValue) => setForm({ ...form, confirmPassword: nextValue })}
        />
        <SigninButton
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
          onPress={submit}
        >
          Regístrate
        </SigninButton>
        <Button appearance="ghost" onPress={() => navigate('Login')}>
          ¿Ya tienes cuenta? Ingresa.
        </Button>
      </Content>
    </KeyboardAwareScroll>
  );
};

export default Signup;
