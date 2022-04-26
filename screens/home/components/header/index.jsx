import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Icon, Layout, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { StyleSheet, Image } from 'react-native';
import Logo from './imgs/home_logo.png';

const Header = () => {
  const { navigate } = useNavigation();

  const EditIcon = (props) => (
    <Icon {...props} fill="#FFD700" name="message-circle" onPress={() => navigate('Messages')} />
  );

  const renderRightActions = () => (
    <>
      <TopNavigationAction icon={EditIcon} />
    </>
  );

  const styles = StyleSheet.create({
    container: {
      minHeight: 100,
      backgroundColor: 'black',
    },
  });

  return (
    <Layout style={styles.container} level="1">
      <TopNavigation
        style={{
          marginTop: 40,
          backgroundColor: 'black',
        }}
        alignment="center"
        accessoryLeft={() => (
          <Image
            // eslint-disable-next-line global-require
            source={Logo}
            style={{ width: 100, height: 25, marginLeft: 10, resizeMode: 'contain' }}
          />
        )}
        accessoryRight={renderRightActions}
      />
    </Layout>
  );
};
export default Header;
