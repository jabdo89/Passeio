import styled from 'styled-components/native';
import { Card as DefaultCard, Layout, Icon as DefaultIcon } from '@ui-kitten/components';

const Card = styled(DefaultCard)`
  height: 150px;
  width: 150px;
  margin-bottom: 0px;
`;

const Tag = styled(Layout)`
  background-color: ${(props) => props.theme[`color-${props.color}-600`]};
  border-radius: 9999999px;
  padding: 5px 10px;
  margin-top: 5px;
  margin-right: auto;
  justify-content: center;
`;

const TagsContainer = styled(Layout)`
  flex-direction: row;
  justify-content: flex-start;
`;

const Icon = styled(DefaultIcon)`
  margin-right: 3px;
`;

const WithIcon = styled.View`
  flex-direction: row;
`;

export { Card, Tag, TagsContainer, Icon, WithIcon };
