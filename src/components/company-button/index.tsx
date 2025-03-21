import type { ColorProps } from "@shopify/restyle";
import React from "react";
import { Image } from "expo-image";
import { scale } from "react-native-size-matters";
import type { IconTypes } from "@/assets/icons";
import { icons } from "@/assets/icons";
import type { Theme } from "@/theme";
import { PressableScale, View } from "@/ui";

type ImageButtonProps = {
  icon?: IconTypes;
  onPress: () => void;
  size?: number;
  imageSize?: number;
  backgroundColor?: ColorProps<Theme>["color"];
  source?: any;
};

export const CompanyButton = ({
  icon,
  size = scale(36),
  imageSize = scale(18),
  onPress,
  backgroundColor,
  source,
}: ImageButtonProps) => {
  return (
    <PressableScale onPress={onPress}>
      <View
        backgroundColor={backgroundColor}
        justifyContent={"center"}
        alignItems={"center"}
        height={size}
        width={size}
        borderRadius={scale(8)}
      >
        <Image
          source={source ? source : icons[icon]}
          style={{
            height: imageSize,
            width: imageSize,
            borderRadius: scale(8),
          }}
          contentFit="contain"
          transition={1000}
          placeholder={`https://fakeimg.pl/400x400/cccccc/cccccc`}
        />
      </View>
    </PressableScale>
  );
};
