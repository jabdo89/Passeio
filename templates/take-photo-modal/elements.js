import styled from 'styled-components';
import { Button } from '@ui-kitten/components';

const Container = styled.View`
  flex: 1;
`;

const PermissionsContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const TakePhoto = styled(Button)`
  border-radius: 99999px;
  width: 80px;
  height: 80px;
  margin-left: auto;
  margin-right: auto;
  margin-top: auto;
  margin-bottom: 40px;
`;

export { Container, PermissionsContainer, TakePhoto };
