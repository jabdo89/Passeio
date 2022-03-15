import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
} from 'react-native';
import { Card, Container, SliderIndicator, SliderIndicatorRow } from './elements';

const BottomModal = ({ visible, onClose, children, ...rest }) => {
  const screenHeight = Dimensions.get('screen').height;
  const panY = useRef(new Animated.Value(screenHeight)).current;

  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  });

  const closeAnim = Animated.timing(panY, {
    toValue: screenHeight,
    duration: 500,
    useNativeDriver: true,
  });

  const translateY = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  });

  const handleDismiss = () => closeAnim.start(onClose);

  useEffect(() => {
    resetPositionAnim.start();
  }, [resetPositionAnim]);

  const panResponders = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderMove: Animated.event([null, { dy: panY }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 0 && gs.vy > 0.5) {
          return handleDismiss();
        }
        return resetPositionAnim.start();
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      onRequestClose={handleDismiss}
      transparent
      animationType="fade"
      {...rest}
    >
      <Container>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Card style={{ transform: [{ translateY }] }} {...panResponders.panHandlers}>
            <SliderIndicatorRow>
              <SliderIndicator />
            </SliderIndicatorRow>
            {children}
          </Card>
        </KeyboardAvoidingView>
      </Container>
    </Modal>
  );
};

BottomModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default BottomModal;
