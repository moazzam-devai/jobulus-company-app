import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@shopify/restyle";
import { useForm } from "react-hook-form";
import { ScrollView, StyleSheet } from "react-native";
import { scale } from "react-native-size-matters";
import * as z from "zod";
import { ScreenHeader } from "@/components/screen-header";
import { useSoftKeyboardEffect } from "@/hooks";
import { useCompanyInformation } from "@/services/api/auth/company-information";
import { useCompanies } from "@/services/api/company";
import type { Theme } from "@/theme";
import { Button, ControlledInput, Screen, Text, View } from "@/ui";
import { DescriptionField } from "@/ui/description-field";
import { showErrorMessage, showSuccessMessage } from "@/utils";
import { queryClient } from "@/services/api/api-provider";
import { useSelection, setSelectedLocation } from "@/store/selection";
import { SelectOptionButton } from "@/components/select-option-button";

const schema = z.object({
  companyName: z.string({
    required_error: "Company name is required",
  }),
  description: z
    .string({
      required_error: "Company detail is required",
    })
    .max(500, "Details must be max 500 characters"),
  location: z.string({
    required_error: "Location is required",
  }),
});

export type AddCompanyFormType = z.infer<typeof schema>;

export const AddCompany = () => {
  const { colors } = useTheme<Theme>();
  const { goBack, navigate } = useNavigation();

  useSoftKeyboardEffect();

  const selectedLocation = useSelection((state) => state.selectedLocation);

  const { mutate: AddCompanyApi, isLoading } = useCompanyInformation();

  const { handleSubmit, control, watch, setValue, trigger } = useForm<AddCompanyFormType>(
    {
      resolver: zodResolver(schema),
    }
  );

  const watchLocation = watch("location");

  const onSubmit = (data: AddCompanyFormType) => {
    const body = {
      company_name: data?.companyName,
      company_description: data?.description,
      google_location: data?.location,
      country_id: selectedLocation?.country,
      city_id: selectedLocation?.city,
    };

    AddCompanyApi(body, {
      onSuccess: (data) => {
        if (data?.response?.status === 200) {
          goBack();
          showSuccessMessage("Company added successfully");
          queryClient.invalidateQueries(useCompanies.getKey());
          setSelectedLocation("");
        } else {
          showErrorMessage(data.response.message);
        }
      },
      onError: (error) => {
        // An error happened!
      },
    });
  };

  useEffect(() => {
    if (selectedLocation) {
      setValue("location", selectedLocation?.address);
      trigger("location");
    }
  }, [selectedLocation]);

  return (
    <Screen backgroundColor={colors.white} edges={["top"]}>
      <ScreenHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View flex={1} paddingHorizontal={"large"}>
          <View height={scale(12)} />

          <View paddingTop={"large"}>
            <Text variant={"semiBold24"} color={"black"}>
              Company Information
            </Text>
            <Text variant={"regular14"} paddingTop={"small"} color={"grey100"}>
              Complete your profile by adding further information
            </Text>
          </View>

          <View paddingTop={"large"} gap={"medium"}>
            <ControlledInput
              placeholder="Enter company name"
              label="Company Name"
              control={control}
              name="companyName"
            />

            <DescriptionField
              placeholder="Enter company details"
              label="About Company"
              control={control}
              name="description"
            />

            <SelectOptionButton
              label="Location"
              isSelected={watchLocation ? true : false}
              selectedText={watchLocation ? watchLocation : "Choose Location"}
              icon={"arrow-ios-down"}
              onPress={() => {
                navigate("ChooseLocation", { from: "Register" });
              }}
            />

            {/* <ControlledInput
              placeholder="Enter location"
              label="Location"
              control={control}
              name="location"
            /> */}
          </View>
          <View height={scale(24)} />
          <Button label="Add" onPress={handleSubmit(onSubmit)} loading={isLoading} />
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: scale(40),
  },
});
