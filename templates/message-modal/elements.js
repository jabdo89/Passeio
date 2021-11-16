import styled from 'styled-components';
import { Button, Layout, Input as DefaultInput } from '@ui-kitten/components';

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

const Form = styled(Layout)`
  display: flex;
  padding: 10px;
  flex-direction: row;
`;

const SendButton = styled(Button)`
  border-radius: 999999px;
  margin-left: 8px;
`;

const WhiteBox = styled(Layout)`
  border-radius: 0;
  margin-bottom: 20;
`;

const Input = styled(DefaultInput)`
  width: 80%;
`;

const Scroll = styled(Layout)`
  height: 100%;
  top: 0%;
  background-color: grey;
`;

const MessagesContainer = styled(Layout)`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const Bubble = styled(Layout)`
  border-radius: 20px;
  padding: 20px;
  margin-top: 5px;
  margin-bottom: 5px;
  max-width: 190;
`;

export {
  Container,
  PermissionsContainer,
  TakePhoto,
  WhiteBox,
  SendButton,
  Form,
  Input,
  Bubble,
  Scroll,
  MessagesContainer,
};
