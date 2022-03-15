import React from 'react';
import { useNavigation } from '@react-navigation/native';
import ExpoFastImage from 'expo-fast-image';
import {
  Icon,
  Layout,
  MenuItem,
  OverflowMenu,
  TopNavigation,
  TopNavigationAction,
  useTheme,
  Text,
} from '@ui-kitten/components';
import { StyleSheet, Image } from 'react-native';

const Header = () => {
  const { navigate } = useNavigation();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const theme = useTheme();

  const EditIcon = (props) => (
    <Icon {...props} fill="#FFD700" name="inbox" onPress={() => navigate('Messages')} />
  );

  const renderRightActions = () => (
    <>
      <TopNavigationAction icon={EditIcon} />
    </>
  );

  const renderBackAction = () => (
    <ExpoFastImage
      source={require('../../images/home_logo.png')}
      cacheKey={'Logo'}
      style={{ width: 100, height: 25, marginLeft: 10, resizeMode: 'contain' }}
    />
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
        accessoryLeft={renderBackAction}
        accessoryRight={renderRightActions}
      />
    </Layout>
  );
};
export default Header;
