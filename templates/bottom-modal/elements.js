import styled from 'styled-components';
import { Animated } from 'react-native';

const Container = styled.View`
  background-color: 'rgba(0,0,0,0.4)';
  flex: 1;
  justify-content: flex-end;
`;

const Card = styled(Animated.View)`
  background-color: ${(props) =>
    props.theme[props.theme['background-basic-color-1'].replace('$', '')]};
  padding-top: 20px;
  padding-right: 20px;
  padding-left: 20px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  min-height: 200px;
  padding-bottom: 40px;
`;

const SliderIndicatorRow = styled.View`
  flex-direction: row;
  margin-bottom: 4px;
  align-items: center;
  justify-content: center;
`;

const SliderIndicator = styled.View`
  background-color: #cecece;
  height: 4px;
  width: 45px;
`;

export { Container, Card, SliderIndicatorRow, SliderIndicator };
