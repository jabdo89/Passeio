import styled from 'styled-components/native';
import { Text, Layout } from '@ui-kitten/components';

const Title = styled(Text)`
  margin-bottom: 5px;
  margin-top: 20px;
`;

const Row = styled(Layout)`
  flex-direction: row;
  padding: 0px 0px;
  align-items: center;
  justify-content: space-between;
`;

export { Title, Row };
