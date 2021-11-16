import styled from 'styled-components/native';
import { Layout, Text, Input as DefaultInput, Button } from '@ui-kitten/components';

const Content = styled(Layout)`
  flex-grow: 1;
  padding: 20px;
`;

const Header = styled(Layout)`
  padding: 0 20px;
  padding-top: ${(props) => (props.pt || 0) + 20}px;
  background-color: ${(props) => props.theme['color-primary-600']};
  padding-top: 60px;
  padding-bottom: 40px;
  align-items: center;
`;

const Title = styled(Text)`
  color: ${(props) => props.theme['color-primary-100']};
  text-align: center;
`;

const Subtitle = styled(Text)`
  color: black;
  font-weight: 800;
  text-align: center;
`;
const Question = styled(Text)`
  margin: 20px;
  font-weight: 300;
  text-align: center;
`;

const Price = styled(Text)`
  margin: 5px;
  font-weight: bold;
  text-align: center;
`;

const Message = styled(Text)`
  margin: 80px;
  font-weight: bold;
  text-align: center;
`;

const Input = styled(DefaultInput)`
  margin: 5px 0;
`;

const SigninButton = styled(Button)`
  margin-top: 40;
`;

const Container = styled(Layout)`
  flex-grow: 1;
  padding: 5px 20px;
  padding-top: ${(props) => (props.pt || 0) + 20}px;
`;

const Row = styled(Layout)`
  flex-direction: row;
  padding: 0px 0px;
  align-items: center;
  justify-content: space-between;
`;

const AvatarSection = styled.View`
  flex-direction: row;
  padding: 0px 0;
`;

const TextSection = styled.View`
  justify-content: center;
  margin-left: 15px;
`;

export {
  Content,
  Container,
  Header,
  Title,
  Subtitle,
  Input,
  Message,
  SigninButton,
  Question,
  Price,
  Row,
  AvatarSection,
  TextSection,
};
