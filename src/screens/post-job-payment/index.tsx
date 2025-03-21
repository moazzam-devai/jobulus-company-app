import React, { useState } from "react";
import { Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@shopify/restyle";
import StepIndicator from "@/components/indicator-2";
import { ScreenHeader } from "@/components/screen-header";
import type { Theme } from "@/theme";
import { Button, Screen, View } from "@/ui";
import { CardField, useConfirmPayment } from "@stripe/stripe-react-native";
import Config from "@/config";

const labels = ["Job Detail", "Post Detail", "Preview", "Payment"];

export const PostJobPayment = () => {
  const { colors } = useTheme<Theme>();
  const { navigate } = useNavigation();
  const route = useRoute<any>();
  const { bottom } = useSafeAreaInsets();

  console.log("route", JSON.stringify(route, null, 2));

  const [name, setName] = useState("");
  const { confirmPayment, loading } = useConfirmPayment();

  const fetchPaymentIntentClientSecret = async () => {
    const response = await fetch(`${Config.API_URL}company/create-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_id: route?.params?.data?.company_id,
        job_id: route?.params?.data?.job_id,
        payment: 25,
        payment_type: "job promotion",
      }),
    });

    const { client_secret } = await response.json();

    return client_secret;
  };

  const handlePayPress = async () => {
    // 1. fetch Intent Client Secret from backend
    const clientSecret = await fetchPaymentIntentClientSecret();
    // console.log("clientSecret", clientSecret);

    // 2. Gather customer billing information (ex. email)
    const billingDetails = { name };

    const { error, paymentIntent } = await confirmPayment(clientSecret, {
      paymentMethodType: "Card",
      paymentMethodData: {
        billingDetails: billingDetails,
      },
    });

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
      console.log("Payment confirmation error", error.message);
    } else if (paymentIntent) {
      Alert.alert(
        "Success",
        `The payment was confirmed successfully! currency: ${paymentIntent.currency}`,
        [{ text: "OK", onPress: () => navigate("JobPosted") }]
      );
      console.log("Success from promise", paymentIntent);
    }
  };

  return (
    <Screen backgroundColor={colors.white} edges={["top"]}>
      <ScreenHeader title={"Payment Methods"} showBorder={true} icon="close" />

      <View
        paddingHorizontal={"large"}
        backgroundColor={"grey500"}
        paddingBottom={"medium"}
      >
        <StepIndicator stepCount={4} currentPosition={3} labels={labels} />
      </View>

      <View flex={1}>
        <CardField
          postalCodeEnabled={false}
          placeholders={{
            number: "4242 4242 4242 4242",
          }}
          cardStyle={{
            backgroundColor: "#FFFFFF",
            textColor: "#000000",
          }}
          style={{
            width: "100%",
            height: 50,
            marginVertical: 30,
          }}
          onCardChange={(cardDetails) => {
            console.log("cardDetails", cardDetails);
          }}
          onFocus={(focusedField) => {
            console.log("focusField", focusedField);
          }}
        />
        {/* <ScrollView> */}
        {/* <View
            paddingHorizontal={"large"}
            flexDirection={"row"}
            justifyContent={"space-between"}
            paddingVertical={"xLarge"}
            alignItems={"center"}
          >
            <Text variant={"medium24"} color={"black"}>
              Pay by Card
            </Text>

            <PressableScale>
              <Text
                variant={"regular13"}
                color={"primary"}
                textDecorationLine={"underline"}
              >
                Add New Card
              </Text>
            </PressableScale>
          </View> */}

        {/* {[0]?.map((element, index) => {
            console.log("element", element);

            return (
              <PressableScale key={index}>
                <View
                  flexDirection={"row"}
                  paddingHorizontal={"large"}
                  alignItems={"center"}
                  paddingVertical={"medium"}
                  marginHorizontal={"large"}
                  backgroundColor={"grey400"}
                  borderRadius={scale(8)}
                >
                  <Image
                    source={icons["master-card"]}
                    style={{ height: scale(24), width: scale(24) }}
                    contentFit="contain"
                  />

                  <View flex={1} paddingHorizontal={"medium"}>
                    <Text variant={"medium14"} color={"black"}>
                      master card****8888
                    </Text>
                    <View
                      backgroundColor={"grey300"}
                      paddingHorizontal={"medium"}
                      //paddingVertical={"small"}
                      height={scale(20)}
                      borderRadius={scale(4)}
                      alignSelf={"flex-start"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      marginTop={"small"}
                    >
                      <Text variant={"medium10"}>default</Text>
                    </View>
                    <Text variant={"medium14"} marginTop={"small"} color={"black"}>
                      Epiration: 12/25
                    </Text>
                  </View>

                  <View>
                    <RadioButton
                      unActiveColor="grey"
                      value={isChecked}
                      onToggle={(value) => {
                        setIsChecked(value);
                      }}
                    />
                  </View>
                </View>
              </PressableScale>
            );
          })} */}
        {/* </ScrollView> */}

        <View
          paddingVertical={"large"}
          paddingBottom={"large"}
          borderTopWidth={1}
          borderTopColor={"grey400"}
        >
          <Button
            label="Pay $12"
            marginHorizontal={"large"}
            loading={loading}
            onPress={() => {
              handlePayPress();
              //   navigate("JobPosted");
            }}
          />
          <View height={bottom} />
        </View>
      </View>
    </Screen>
  );
};
