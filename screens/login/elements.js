import styled from 'styled-components/native';
import { Layout, Text, Input as DefaultInput, Button } from '@ui-kitten/components';

const Content = styled(Layout)`
  flex-grow: 1;
  padding: 20px;
  background: transparent;
`;

const Header = styled(Layout)`
  padding: 0 20px;
  padding-top: ${(props) => (props.pt || 0) + 20}px;
  background-color: ${(props) => props.theme['color-primary-600']};
  padding-top: 100px;
  padding-bottom: 80px;
  align-items: center;
`;

const Title = styled(Text)`
  color: ${(props) => props.theme['color-primary-100']};
  text-align: center;
  font-size: 55px;
`;

const Subtitle = styled(Text)`
  color: ${(props) => props.theme['color-primary-100']};
  font-weight: 300;
  text-align: center;
  font-size: 25px;
`;

const Input = styled(DefaultInput)`
  margin: 9px 0;
  width: 85%;
  margin-left: auto;
  margin-right: auto;
`;

const SigninButton = styled(Button)`
  margin-top: auto;
`;

export { Content, Header, Title, Subtitle, Input, SigninButton };
