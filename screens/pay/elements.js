import styled from 'styled-components/native';
import { Layout, Text, Button } from '@ui-kitten/components';

const Container = styled(Layout)`
  flex-grow: 1;
  padding-top: ${(props) => (props.pt || 0) + 20}px;
`;

const Title = styled(Text)`
  padding: 20px;
`;

const Content = styled(Layout)`
  flex-grow: 1;
  padding: 20px;
`;

const Tag = styled(Layout)`
  background-color: ${(props) => props.theme[`color-${props.color}-600`]};
  border-radius: 9999999px;
  padding: 5px 10px;
  margin-top: 5px;
  margin-right: auto;
  justify-content: center;
`;

const Row = styled(Layout)`
  flex-direction: row;
  padding: 0px 0px;
  align-items: center;
  justify-content: space-between;
`;

const SigninButton = styled(Button)`
  margin-top: 40;
`;

const Status = styled(Text)`
  margin-left: 20px;
  font-weight: bold;
  text-align: left;
  font-size: 14;
`;
export { Container, Tag, Title, Row, Status, SigninButton, Content };
