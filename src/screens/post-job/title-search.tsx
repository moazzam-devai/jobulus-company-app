import React from "react";
import { MotiView } from "moti";
import { StyleSheet } from "react-native";
import { palette } from "@/theme";

const TitleSearch = ({ children }) => {
  return (
    <MotiView
      from={{
        opacity: 0,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.98,
      }}
      exitTransition={{
        type: "timing",
        duration: 300,
      }}
      style={styles.shape}
    >
      {children}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  shape: {
    height: 300,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: palette.grey500,
  },
});
export default TitleSearch;
