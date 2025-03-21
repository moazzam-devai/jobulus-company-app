import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from "react-native";
import { scale } from "react-native-size-matters";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { icons } from "@/assets/icons";
import { CompanyButton } from "@/components/company-button";
import { ScreenHeader } from "@/components/screen-header";
import { useSoftKeyboardEffect } from "@/hooks";
import { queryClient } from "@/services/api/api-provider";
import {
  useCompanies,
  useEditCompany,
  useGetCompanyDetails,
} from "@/services/api/company";
import { useUser } from "@/store/user";
import type { Theme } from "@/theme";
import { Button, ControlledInput, Screen, Text, View } from "@/ui";
import { DescriptionField } from "@/ui/description-field";
import { showErrorMessage, showSuccessMessage } from "@/utils";
import * as mime from "react-native-mime-types";
import Loader from "@/components/loader";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useUpdatePicture } from "@/services/api/company";
import * as ImagePicker from "expo-image-picker";
import { SelectOptionButton } from "@/components/select-option-button";
import { useSelection, setSelectedLocation } from "@/store/selection";

const schema = z.object({
  companyName: z.string({
    required_error: "Company name is required",
  }),
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid email format"),
  phone: z.string({
    required_error: "phone is required",
  }),

  website: z.string({
    required_error: "Website is required",
  }),
  bio: z.string({
    required_error: "Bio is required",
  }),
  employees: z.string().optional(),
  wage: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  location: z.string().optional(),
  facebook: z.string().optional(),
  instgram: z.string().optional(),
  whatsapp: z.string().optional(),
});

export type EditCompanyFormType = z.infer<typeof schema>;

export const EditCompany = () => {
  const { colors } = useTheme<Theme>();
  const { goBack, navigate } = useNavigation();
  const route = useRoute<any>();
  const { width } = useWindowDimensions();
  const { showActionSheetWithOptions } = useActionSheet();
  const selectedLocation = useSelection((state) => state.selectedLocation);

  useSoftKeyboardEffect();

  const company = useUser((state) => state?.company);
  const { mutate: editCompanyApi, isLoading } = useEditCompany();
  const { mutate: updateProfilePic, isLoading: savingPic } = useUpdatePicture();

  const data = route?.params?.data;

  //  console.log("company_id", JSON.stringify(data, null, 2));

  const [image, setImage] = useState(null);
  const [picTyp, setPicType] = useState(null);

  const [cameraPermissionStatus, requestCameraPermission] =
    ImagePicker.useCameraPermissions();
  const [galleryPermission, requestGallaryPermission] =
    ImagePicker.useMediaLibraryPermissions();

  const { handleSubmit, control, setValue, watch, trigger } =
    useForm<EditCompanyFormType>({
      resolver: zodResolver(schema),
      defaultValues: {
        companyName: data?.name,
        email: data?.email,
        phone: data?.location?.phone,
        website: data?.location?.website,
        bio: data?.short_description,
        employees: data?.no_of_employees,
        wage: data?.average_wage,
        address: data?.location?.address_1,
        city: data?.location?.city_name,
        country: data?.location?.country_name,
        facebook: data?.facebook_link,
        instgram: data?.instagram_link,
        whatsapp: data?.twitter_link,
      },
    });

  const watchLocation = watch("location");

  const onSubmit = (data: EditCompanyFormType) => {
    const body = {
      name: data?.companyName,
      email: data?.email,
      contact_number: data?.phone,
      no_of_employees: parseInt(data?.employees),
      start_time: "9 am",
      end_time: "6 pm",
      average_wage: parseInt(data?.wage),
      languages: [1, 2],
      categories: [1, 2],
      company_id: company?.id,
      short_description: data?.bio,
      facebook_link: data?.facebook,
      instagram_link: data?.instgram,
      twitter_link: data?.whatsapp,
      locations: {
        address_1: data?.address,
        address_2: "",
        city_id: data?.city,
        country_id: data?.country,
        phone: data?.phone,
        email: data?.email,
        website: data?.website,
        web_location: "",
        longitude: "0.00000",
        latitude: "0.0000",
        google_location: data?.location,
      },
    };

    //console.log("body", JSON.stringify(body, null, 2));

    editCompanyApi(body, {
      onSuccess: (responseData) => {
        if (responseData?.status === 200) {
          showSuccessMessage(responseData?.message ?? "");
          queryClient.invalidateQueries(useCompanies.getKey());
          queryClient.invalidateQueries(useGetCompanyDetails.getKey());
          goBack();
        } else {
          showErrorMessage(responseData?.message ?? "");
        }
      },
      onError: (error) => {
        //@ts-ignore
        showErrorMessage(error?.response?.data?.message ?? "");
      },
    });
  };

  useEffect(() => {
    setValue("bio", data?.short_description);
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      setValue("location", selectedLocation?.address);
      setValue("country", selectedLocation?.country);
      setValue("city", selectedLocation?.city);
      trigger("location");
      trigger("country");
      trigger("city");
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (!cameraPermissionStatus?.granted) {
      requestCameraPermission();
    }
    if (!galleryPermission?.granted) {
      requestGallaryPermission();
    }
  }, []);

  const updateProfilePicApiCall = ({
    asset,
    picType,
  }: {
    asset: any;
    picType: "pic" | "cover";
  }) => {
    const data = new FormData();

    console.log({ picType });

    let fileName;
    if (asset.fileName === null) {
      const uriParts = asset.uri.split("/");
      fileName = uriParts[uriParts.length - 1];
    } else {
      fileName = asset.fileName;
    }

    data.append("file", {
      name: fileName,
      type: mime.lookup(asset?.uri?.replace("file://", "")),
      uri: Platform.OS === "ios" ? asset?.uri?.replace("file://", "") : asset?.uri,
    });

    data?.append("company_id", route?.params?.data?.id);
    data?.append("image_type", picType);

    // @ts-ignore
    updateProfilePic(data, {
      onSuccess: (response: any) => {
        console.log("response", response);

        if (response?.status === 200) {
          queryClient.invalidateQueries(useCompanies.getKey());
          queryClient.invalidateQueries(useGetCompanyDetails.getKey());
          // if (user?.unique_id === route?.params?.user?.unique_id) {
          //   setProfilePic(response?.response?.path);
          // }
          // goBack();
          showSuccessMessage("Picture Updated successfully");
        } else {
        }
      },
      onError: (error) => {
        // An error happened!
        // @ts-ignore
        console.log(`error`, error?.response?.data?.message);
      },
    });
  };

  const pickImage = async (picType) => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: picType === "cover" ? [4, 2] : [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setPicType(picType);
      const asset = result?.assets[0];
      updateProfilePicApiCall({ asset, picType });
    }
  };

  const takeImage = async (picType) => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setPicType(picType);
      const asset = result?.assets[0];
      updateProfilePicApiCall({ asset, picType });
    }
  };

  const takeProfilePic = ({ picType }: { picType: "pic" | "cover" }) => {
    const options = ["Gallery", "Camera", "Cancel"];
    const destructiveButtonIndex = 2;
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex: number) => {
        switch (selectedIndex) {
          case 0:
            // Save
            pickImage(picType);
            break;
          case 1:
            // Save
            takeImage(picType);
            break;
          case destructiveButtonIndex:
            // Delete
            break;

          case cancelButtonIndex:
          // Canceled
        }
      }
    );
  };

  return (
    <Screen backgroundColor={colors.white} edges={["top"]}>
      <ScreenHeader title={data?.name} showBorder={true} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View>
          <View>
            <Image
              source={picTyp === "cover" ? image : data?.images?.cover}
              style={{ height: scale(119), width: width }}
            />
            <TouchableOpacity
              onPress={() => takeProfilePic({ picType: "cover" })}
              style={{ position: "absolute", right: 10, top: 10 }}
            >
              <View
                backgroundColor={"white"}
                justifyContent={"center"}
                alignItems={"center"}
                height={scale(24)}
                width={scale(24)}
                borderRadius={scale(8)}
              >
                <Image
                  contentFit="contain"
                  source={icons["camera"]}
                  style={{ height: scale(16), width: scale(16) }}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View
            alignSelf={"flex-start"}
            position={"absolute"}
            marginLeft={"large"}
            style={{
              bottom: -scale(43),
            }}
          >
            <CompanyButton
              source={picTyp === "pic" ? image : data?.images?.pic}
              onPress={() => null}
              size={scale(86)}
              imageSize={scale(86)}
            />
            <View position={"absolute"} top={10} right={10}>
              <TouchableOpacity onPress={() => takeProfilePic({ picType: "pic" })}>
                <View
                  backgroundColor={"white"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  height={scale(24)}
                  width={scale(24)}
                  borderRadius={scale(8)}
                >
                  <Image
                    contentFit="contain"
                    source={icons["camera"]}
                    style={{ height: scale(16), width: scale(16) }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View height={scale(44)} />

        <View paddingTop={"large"} paddingHorizontal={"large"} rowGap={"small"}>
          <ControlledInput
            placeholder="Enter company name"
            label="Company Name"
            control={control}
            name="companyName"
          />

          <ControlledInput
            placeholder="Enter company email"
            label="Company Email"
            control={control}
            name="email"
          />

          <ControlledInput
            placeholder="Enter contact number"
            label="Contact Number"
            control={control}
            name="phone"
          />
          <ControlledInput
            placeholder="Enter website"
            label="Website"
            control={control}
            name="website"
          />
          <DescriptionField
            placeholder="Enter bio"
            label="Bio"
            control={control}
            name="bio"
          />
          <ControlledInput
            placeholder="Enter how many employees you have."
            label="Number Employess"
            control={control}
            name="employees"
          />
          <ControlledInput
            placeholder="Enter average wage"
            label="Average"
            control={control}
            name="wage"
          />
          <ControlledInput
            placeholder="Enter address"
            label="Address"
            control={control}
            name="address"
          />
          <ControlledInput
            placeholder="Enter city"
            label="City"
            control={control}
            name="city"
          />
          <ControlledInput
            placeholder="Enter country"
            label="Country"
            control={control}
            name="country"
          />
          <ControlledInput
            placeholder="Enter postal code"
            label="Postal code"
            control={control}
            name="postalCode"
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
            placeholder="Enter location."
            label="Location"
            control={control}
            name="location"
          /> */}
          <ControlledInput
            placeholder="Enter facebook"
            label="Facebook"
            control={control}
            name="facebook"
          />
          <ControlledInput
            placeholder="Enter instagram"
            label="Instgram"
            control={control}
            name="instgram"
          />
          <ControlledInput
            placeholder="Enter whatsapp."
            label="Whatsapp"
            control={control}
            name="whatsapp"
          />
        </View>
        <View height={scale(24)} />
        <View flex={1} justifyContent={"flex-end"} paddingHorizontal={"large"}>
          <Button label="Update" onPress={handleSubmit(onSubmit)} loading={isLoading} />
        </View>
      </ScrollView>
      <Loader isVisible={savingPic} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: scale(160),
  },
});
