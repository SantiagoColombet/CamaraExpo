import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as ImageManipulator from "expo-image-manipulator";

export default function App() {
  const [permiso, solicitarPermiso] = useCameraPermissions();
  const [uriFoto, setUriFoto] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const camaraRef = useRef(null);      

  if (!permiso) {
    return (
      <View style={styles.center}>
        <Text>Cargando permisos...</Text>
      </View>
    );
  }

  if (!permiso.granted) {
    return (
      <View style={styles.center}>
        <Text>Necesitamos permiso para usar la cámara</Text>
        {/*Este botón ejecuta solicitarPermiso, función que 
          muestra el pop-up nativo del sistema para
          que el usuario permita el uso de la cámara*/}
        <TouchableOpacity onPress={solicitarPermiso} style={styles.button}>
          <Text>Dar permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tomarFoto = async () => {
    if (!camaraRef.current) return; // Verifica que la cámara exista
    try {
      const foto = await camaraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: false,
      });
      setUriFoto(foto.uri); // Guarda la ruta de la foto
    } catch (e) {
      console.error("Error tomando foto:", e);
    }
  };

  const guardarEnGaleria = async (uri) => {
    if (!uri) return; // Verifica que haya una foto
    setProcesando(true); 
    try {
      await MediaLibrary.createAssetAsync(uri); // Guarda la foto en la galería
      alert("Foto guardada en la galería");
    } catch (e) {
      console.error(e);
      alert("Error guardando la foto");
    } finally {
      setProcesando(false);
    }
  };

  const aplicarEfecto = async () => {
    if (!uriFoto) return; // Verifica que haya una foto
    setProcesando(true);
    try {
      const resultado = await ImageManipulator.manipulateAsync(
        uriFoto,
        [
          { resize: { width: 800 } },
          { rotate: 90 }
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG
        }
      );
      setUriFoto(resultado.uri);
      alert("Efecto aplicado (resize + rotate)");
    } catch (e) {
      console.error(e);
      alert("Error aplicando efecto");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {!uriFoto ? (
        //Muestra la camara si todavia no tomaste una foto
        <CameraView style={{ flex: 1 }} ref={camaraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity onPress={tomarFoto} style={styles.button}>
              <Text>TOMAR FOTO</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        //Muestra la foto tomada 
        <View style={styles.preview}>
          <Image
            source={{ uri: uriFoto }}
            style={styles.image}
            resizeMode="contain"
          />
          <View style={styles.row}>

            {/*Vuelve a la pantalla principal*/}
            <TouchableOpacity onPress={() => setUriFoto(null)} style={styles.smallButton}>
              <Text>VOLVER</Text>
            </TouchableOpacity>

            {/*Guarda la foto en la galeria*/}
            <TouchableOpacity onPress={() => guardarEnGaleria(uriFoto)} style={styles.smallButton}>
              <Text>{procesando ? "Guardando..." : "GUARDAR"}</Text>
            </TouchableOpacity>

             {/*Aplica efectos (redimenciona y rota la imagen)*/}
            <TouchableOpacity onPress={aplicarEfecto} style={styles.smallButton}>
              <Text>{procesando ? "Procesando..." : "EFECTO"}</Text>
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
