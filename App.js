import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as ImageManipulator from "expo-image-manipulator";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const [processing, setProcessing] = useState(false);
  const cameraRef = useRef(null);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Cargando permisos...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Necesitamos permiso para usar la cámara</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text>Dar permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      setPhotoUri(photo.uri);
    } catch (e) {
      console.error("Error tomando foto:", e);
    }
  };

  const saveToGallery = async (uri) => {
    if (!uri) return;
    setProcessing(true);
    try {
      await MediaLibrary.createAssetAsync(uri);
      alert("Foto guardada en la galería ✅");
    } catch (e) {
      console.error(e);
      alert("Error guardando la foto ❌");
    } finally {
      setProcessing(false);
    }
  };

  const applyEffect = async () => {
    if (!photoUri) return;
    setProcessing(true);
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        photoUri,
        [{ resize: { width: 800 } }, { rotate: 90 }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      setPhotoUri(manipResult.uri);
      alert("Efecto aplicado (resize + rotate) 🎨");
    } catch (e) {
      console.error(e);
      alert("Error aplicando efecto ❌");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {!photoUri ? (
        <CameraView style={{ flex: 1 }} ref={cameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity onPress={takePhoto} style={styles.button}>
              <Text>TOMAR FOTO</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        <View style={styles.preview}>
          <Image
            source={{ uri: photoUri }}
            style={styles.image}
            resizeMode="contain"
          />
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => setPhotoUri(null)}
              style={styles.smallButton}
            >
              <Text>VOLVER</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => saveToGallery(photoUri)}
              style={styles.smallButton}
            >
              <Text>{processing ? "Guardando..." : "GUARDAR"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={applyEffect} style={styles.smallButton}>
              <Text>{processing ? "Procesando..." : "EFECTO"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cameraControls: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 20,
  },
  button: { backgroundColor: "#fff", padding: 12, borderRadius: 8 },
  preview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  image: { width: "100%", height: "80%" },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    padding: 10,
  },
  smallButton: { backgroundColor: "#ddd", padding: 10, borderRadius: 6 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
