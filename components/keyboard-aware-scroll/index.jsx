import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const styles = StyleSheet.create({
  keyboardAware: {
    flex: 1,
  },
});

const KeyboardAwareScroll = ({ children }) => {
  return (
    <>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.keyboardAware}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </KeyboardAwareScrollView>
    </>
  );
};

KeyboardAwareScroll.propTypes = {
  children: PropTypes.node.isRequired,
};

export default KeyboardAwareScroll;
