import styled from 'styled-components/native';
import { Text, Layout } from '@ui-kitten/components';

const Container = styled(Layout)`
  flex-grow: 1;
  padding: 20px;
  padding-top: ${(props) => props.pt || 0}px;
`;

const Content = styled(Layout)``;

const Row = styled(Layout)`
  flex-direction: row;
  padding: 20px 0px;
  align-items: center;
`;

const OptionText = styled(Text)`
  margin-right: auto;
  font-weight: bold;
  font-size: 18;
`;

const AvatarSection = styled.View`
  flex-direction: row;
  padding: 20px 0;
`;

const TextSection = styled.View`
  justify-content: center;
  margin-left: 20px;
`;

export { Container, Content, Row, OptionText, AvatarSection, TextSection };
