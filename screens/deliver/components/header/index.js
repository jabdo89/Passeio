import React from 'react';
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
import { StyleSheet } from 'react-native';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

const EditIcon = (props) => <Icon {...props} name="edit" />;

const MenuIcon = (props) => <Icon {...props} name="more-vertical" />;

const InfoIcon = (props) => <Icon {...props} name="info" />;

const LogoutIcon = (props) => <Icon {...props} name="log-out" />;

const Header = () => {
  const [menuVisible, setMenuVisible] = React.useState(false);
  const theme = useTheme();

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const renderMenuAction = () => <TopNavigationAction icon={MenuIcon} onPress={toggleMenu} />;

  const renderRightActions = () => (
    <>
      <TopNavigationAction icon={EditIcon} />
      <OverflowMenu anchor={renderMenuAction} visible={menuVisible} onBackdropPress={toggleMenu}>
        <MenuItem accessoryLeft={InfoIcon} title="About" />
        <MenuItem accessoryLeft={LogoutIcon} title="Logout" />
      </OverflowMenu>
    </>
  );

  const renderBackAction = () => <TopNavigationAction icon={BackIcon} />;

  const styles = StyleSheet.create({
    container: {
      minHeight: 100,
      backgroundColor: theme['color-primary-600'],
    },
  });

  return (
    <Layout style={styles.container} level="1">
      <TopNavigation
        style={{
          marginTop: 40,
          backgroundColor: theme['color-primary-600'],
        }}
        alignment="center"
        title={() => (
          <Text
            style={{
              fontSize: 15,
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            Passeio
          </Text>
        )}
        subtitle="Entregar Paquete"
        accessoryLeft={renderBackAction}
        accessoryRight={renderRightActions}
      />
    </Layout>
  );
};
export default Header;
