import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { View, Modal } from 'react-native';
import {
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
  Icon,
  Button,
} from '@ui-kitten/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera } from 'expo-camera';
import { Container, PermissionsContainer, TakePhoto } from './elements';

const TakePhotoModal = ({ visible, onClose, onPhotoTaken, ...rest }) => {
  const camera = useRef();
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [taking, setTaking] = useState(false);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const { top } = useSafeAreaInsets();

  const requestPermissions = async () => {
    if (visible) {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    }
  };

  useEffect(() => {
    requestPermissions();
  }, [visible]);

  const takePhoto = async () => {
    setTaking(true);
    const photo = await camera.current.takePictureAsync({
      quality: 0.2,
    });

    const resp = await fetch(photo.uri);
    const imageBlob = await resp.blob();

    onPhotoTaken({ localUrl: photo, imageBlob });
    setTaking(false);
    onClose();
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} {...rest}>
      {hasPermission === null ? (
        <View />
      ) : hasPermission === false ? (
        <PermissionsContainer>
          <Text>Necesitas darle acceso a la cámara</Text>
          <Button style={{ marginTop: 10 }} onPress={requestPermissions}>
            Solicitar acceso
          </Button>
        </PermissionsContainer>
      ) : (
        <Container>
          <Camera
            ref={camera}
            onCameraReady={() => setCameraReady(true)}
            style={{ flex: 1 }}
            type={type}
          >
            <Layout
              style={{
                paddingTop: top,
              }}
            >
              <TopNavigation
                alignment="center"
                title="Toma una foto"
                accessoryLeft={() => (
                  <TopNavigationAction
                    onPress={onClose}
                    icon={(props) => <Icon {...props} name="arrow-back" />}
                  />
                )}
                accessoryRight={() => (
                  <TopNavigationAction
                    onPress={() =>
                      setType(
                        type === Camera.Constants.Type.back
                          ? Camera.Constants.Type.front
                          : Camera.Constants.Type.back
                      )
                    }
                    icon={(props) => <Icon {...props} name="flip-outline" />}
                  />
                )}
              />
            </Layout>
            {cameraReady && (
              <TakePhoto
                disabled={taking}
                onPress={takePhoto}
                accessoryLeft={(props) => <Icon {...props} name="camera-outline" />}
              />
            )}
          </Camera>
        </Container>
      )}
    </Modal>
  );
};

TakePhotoModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPhotoTaken: PropTypes.func.isRequired,
};

export default TakePhotoModal;
