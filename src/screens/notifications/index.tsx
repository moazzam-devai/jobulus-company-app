import React, { useCallback } from "react";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "@shopify/restyle";
import { scale } from "react-native-size-matters";
import { ScreenHeader } from "@/components/screen-header";
import type { Theme } from "@/theme";
import { PressableScale, Screen, Text, View } from "@/ui";
import NotificationListItem from "./notification-list-item";
import { useNotifications, useNotificationMarkAsRead } from "@/services/api/notification";
import ActivityIndicator from "@/components/activity-indicator";
import { showErrorMessage, showSuccessMessage } from "@/utils";
import { queryClient } from "@/services/api/api-provider";

export const Notifications = () => {
  const { colors } = useTheme<Theme>();

  const { isLoading, data } = useNotifications();
  const { mutate: markNotificationAsRead, isLoading: markingAsRead } =
    useNotificationMarkAsRead();

  console.log("data", JSON.stringify(data, null, 2));

  const renderItem = useCallback(({ item }) => {
    return <NotificationListItem item={item} />;
  }, []);

  const RenderLoader = () => {
    return (
      <View flex={1} justifyContent={"center"} alignItems={"center"}>
        <ActivityIndicator size={"large"} />
      </View>
    );
  };

  return (
    <Screen backgroundColor={colors.white} edges={["top"]}>
      <ScreenHeader
        title="Notification"
        icon={"close"}
        rightElement={
          <PressableScale
            onPress={() => {
              markNotificationAsRead(
                { notifications: ["21"] },
                {
                  onSuccess: (data) => {
                    console.log("data", data);
                    if (data?.response?.status === 200) {
                      showSuccessMessage("Notifications marked as read sucessfully");
                      queryClient.invalidateQueries(useNotifications.getKey());
                    } else {
                      showErrorMessage(data?.response?.message);
                    }
                  },
                  onError: (error) => {
                    console.log("error", error);
                    // An error happened!
                  },
                }
              );
            }}
          >
            <Text variant={"medium14"} color={"blue"}>
              {markingAsRead ? "Marking" : "Mark all as read"}
            </Text>
          </PressableScale>
        }
      />

      <View flex={1} backgroundColor={"grey500"}>
        {isLoading ? (
          <RenderLoader />
        ) : (
          <FlashList
            //@ts-ignore
            data={data?.response.data?.data}
            renderItem={renderItem}
            estimatedItemSize={150}
            ListHeaderComponent={
              <View paddingHorizontal={"large"} paddingVertical={"small"}>
                <Text variant={"regular14"} color={"grey300"} backgroundColor={"error"}>
                  New
                </Text>
              </View>
            }
            ListEmptyComponent={
              <View height={scale(300)} justifyContent={"center"} alignItems={"center"}>
                <Text>No Notification Found</Text>
              </View>
            }
          />
        )}
      </View>
    </Screen>
  );
};
