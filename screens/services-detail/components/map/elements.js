import styled from 'styled-components/native';
import { Text } from '@ui-kitten/components';
import MapView from '../../../../templates/map-view';

const CustomMarker = styled.View`
  height: ${(props) => (props.current ? '20px' : '30px')};
  width: ${(props) => (props.current ? '20px' : '30px')};
  border-radius: 15px;
  background-color: ${(props) =>
    props.current ? props.theme['color-warning-600'] : props.theme['color-success-600']};
  align-items: center;
  justify-content: center;
`;

const MarkerText = styled(Text)`
  font-size: ${(props) => (props.current ? '8' : '14')};
  color: ${(props) => props.theme['color-basic-100']};
`;

const BackgroundMap = styled(MapView)`
  height: 290px;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

export { CustomMarker, MarkerText, BackgroundMap };
