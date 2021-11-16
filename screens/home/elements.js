import styled from 'styled-components/native';
import { Layout, Text, Input as DefaultInput } from '@ui-kitten/components';

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
  color: ${(props) => props.theme['color-primary-100']};
  font-weight: 300;
  text-align: center;
`;

const Welcome = styled(Text)`
  margin-left: 20px;
  font-weight: bold;
  text-align: left;
  color: white;
  font-size: 22;
`;
const WelcomeSubTitle = styled(Text)`
  margin-left: 20px;
  margin_bottom: 20px;
  font-weight: normal;
  text-align: left;
  color: white;
  font-size: 14;
`;

const Container = styled(Layout)`
  flex-grow: 1;
`;

const AvatarSection = styled.View`
  margin-top: 40px;
  margin-left:15px
  flex-direction: row;
  padding: 20px 0;
`;

const Row = styled(Layout)`
  height: 100;
  background-color: transparent;
  flex-direction: row;
  padding: 0px 0px;
  align-items: center;
  justify-content: center;
`;

const HeaderRow = styled(Layout)`
  background-color: transparent;
  width: 90%;
  flex-direction: row;
  padding: 0px 0px;
  align-items: center;
  justify-content: space-between;
`;

const HeaderSection = styled(Layout)`
  height: auto;
  background-color: #eabe3f;
  border-bottom-left-radius: 25px;
  border-bottom-right-radius: 25px;
  margin-bottom: 10px;
`;

const Input = styled(DefaultInput)`
  margin: 5px 0;
  width: 350px;
  margin-right: auto;
  margin-left: auto;
  margin-top: 50px;
  border-radius: 50;
`;

export {
  Content,
  Row,
  WelcomeSubTitle,
  Container,
  Header,
  Title,
  Subtitle,
  AvatarSection,
  Welcome,
  HeaderSection,
  HeaderRow,
  Input,
};
