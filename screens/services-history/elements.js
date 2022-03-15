import styled from 'styled-components/native';
import { Layout, Text } from '@ui-kitten/components';

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

export { Container, Tag, Title };
