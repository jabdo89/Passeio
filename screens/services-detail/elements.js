import styled from 'styled-components/native';
import { Layout, Text, Button } from '@ui-kitten/components';

const Container = styled(Layout)`
  flex-grow: 1;
  padding-top: ${(props) => (props.pt || 0) + 20}px;
`;

const Title = styled(Text)`
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
  height: 50;
  margin-left: 70px;
  background-color: transparent;
  flex-direction: row;
  padding: 0px 0px;
  align-items: center;
  justify-content: flex-start;
`;

const Status = styled(Text)`
  margin-left: 20px;
  font-weight: bold;
  text-align: left;
  font-size: 14;
`;
const ActionButton = styled(Button)`
  margin-left: 60px;
  margin-right: 60px;
  margin-top: 20px;
`;

const FloatingButton = styled(Button)`
  position: absolute;
  right: 20px;
  bottom: 210px;
  border-radius: 999999px;
  height: 55px;
  width: 55px;
`;
export { Container, Tag, Title, Row, Status, ActionButton, FloatingButton };
