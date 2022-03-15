import React from 'react';
import PropTypes from 'prop-types';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation, BottomNavigationTab, Icon } from '@ui-kitten/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Send from '@screens/send';
import Home from '@screens/home';
import Deliver from '@screens/deliver';
import Pay from '@screens/pay';
import ServiceList from '@screens/services-list';
import ServiceDetail from '@screens/services-detail';
import Messages from '@screens/messages';
import Profile from '@screens/profile';
import History from '@screens/services-history';

const { Navigator: BottomNavigator, Screen: BottomScreen } = createBottomTabNavigator();

const BottomBar = ({ navigation, state }) => {
  const { bottom } = useSafeAreaInsets();
  return (
    <BottomNavigation
      indicatorStyle={{ backgroundColor: '#FFD700', height: 4 }}
      selectedIndex={state.index}
      onSelect={(index) => navigation.navigate(state.routeNames[index])}
      style={{
        paddingBottom: bottom,
        paddingTop: 20,
        backgroundColor: 'black',
      }}
    >
      <BottomNavigationTab
        title="Inicio"
        icon={(props) => {
          return <Icon {...props} name="home" />;
        }}
      />
      <BottomNavigationTab
        title="Enviar"
        icon={(props) => <Icon {...props} name="arrowhead-up" />}
      />
      <BottomNavigationTab title="Entregar" icon={(props) => <Icon {...props} name="car" />} />
      <BottomNavigationTab title="Pedidos" icon={(props) => <Icon {...props} name="calendar" />} />
      <BottomNavigationTab title="Perfil" icon={(props) => <Icon {...props} name="person" />} />
    </BottomNavigation>
  );
};

const Main = () => {
  return (
    <BottomNavigator tabBar={(props) => <BottomBar {...props} />}>
      <BottomScreen name="Home" component={Home} />
      <BottomScreen name="Send" component={Send} />
      <BottomScreen name="Deliver" component={Deliver} />
      <BottomScreen name="ServiceList" component={ServiceList} />
      <BottomScreen name="Profile" component={Profile} />
      <BottomScreen name="ServiceDetail" component={ServiceDetail} />
      <BottomScreen name="Pay" component={Pay} />
      <BottomScreen name="Messages" component={Messages} />
      <BottomScreen name="History" component={History} />
    </BottomNavigator>
  );
};

BottomBar.propTypes = {
  navigation: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
};

export default Main;
