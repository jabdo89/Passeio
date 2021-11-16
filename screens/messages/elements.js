import styled from 'styled-components';
import { Layout, Input as DefaultInput, Button, Text } from '@ui-kitten/components';

const WhiteBox = styled(Layout)`
  border-radius: 0;
  background-color: red;

  ${(props) =>
    props.top &&
    `
    top: ${props.top};
  `}

  ${(props) =>
    props.bottom &&
    `
    bottom: ${props.bottom};
  `}
  
  ${(props) =>
    props.height &&
    `
    height: ${props.height};
    max-height: ${props.height};
  `}
`;

const Container = styled(Layout)`
  flex-grow: 1;
  padding: 5px 10px;
  padding-top: ${(props) => (props.pt || 0) + 20}px;
`;

const Scroll = styled(Layout)`
  height: 90%;
  background-color: black;
`;

const MessagesContainer = styled(Layout)`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-right: 10px;
  padding-left: 10px;
  padding-top: 70px;
  padding-bottom: 70px;
`;

const CloseButton = styled(Button)`
  svg {
    font-size: 22px;
  }
`;

const ActionButton = styled(Button)`
  svg {
    margin-left: 5px;
  }
`;

const Form = styled(Layout)`
  display: flex;
  padding: 10px;
  flex-direction: row;
`;

const Title = styled(Text)`
  padding: 20px;
`;

const Input = styled(DefaultInput)`
  width: 80%;
`;

const Subtitle = styled(Text)`
  color: black;
  font-weight: 600;
`;

const SendButton = styled(Button)`
  border-radius: 999999px;
  margin-left: 5px;
`;

const Bubble = styled(Layout)`
  color: red;
  background-color: grey;
  border-radius: 99999px;
  padding: 15px;
  font-size: 15px;
  margin-top: 5px;
  margin-bottom: 5px;
  max-width: 100px;
`;

export {
  Container,
  Bubble,
  Subtitle,
  Title,
  WhiteBox,
  SendButton,
  MessagesContainer,
  Scroll,
  CloseButton,
  ActionButton,
  Form,
  Input,
};
