import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { scale } from "react-native-size-matters";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { icons } from "@/assets/icons";
import SelectionBox from "@/components/drop-down";
import StepIndicator from "@/components/indicator-2";
import { ScreenHeader } from "@/components/screen-header";
import {
  useEducationLevels,
  useExperienceLevels,
  useJobTypes,
} from "@/services/api/settings";
import { useJobTitles } from "@/services/api/post-job";
import { setJobPost } from "@/store/post-job";
import { palette, type Theme } from "@/theme";
import { Button, ControlledInput, Screen, Text, View } from "@/ui";
import { SkillsTextField } from "@/ui/skills-field";
import { setPostJobDescription2 } from "@/store/post-job";
import { AnimatePresence } from "moti";
import TitleSearch from "./title-search";
import { useDebounce } from "@/hooks";
import { showErrorMessage } from "@/utils";

const labels = ["Job Detail", "Post Description", "Post Detail", "Preview"];

const schema = z.object({
  title: z.string({
    required_error: "Job title is required",
  }),
  // description: z
  //   .string({
  //     required_error: "Job description is required",
  //   })
  //   .max(1500, "Details must be max 1500 characters"),
  experience: z.string({
    required_error: "Experience level is required",
  }),
  education: z.string({
    required_error: "Education level is required",
  }),
  jobType: z.string({
    required_error: "Job type is required",
  }),
});

export type PostJobFormType = z.infer<typeof schema>;

export const Postjob = () => {
  const { colors } = useTheme<Theme>();
  const navigation = useNavigation();

  //  useSoftKeyboardEffect();

  const [skillValue, setSkillValue] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [value, setTextValue] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const debouncedSearch = useDebounce<string>(searchQuery, 300);

  const { handleSubmit, control, formState, setValue, watch } = useForm<PostJobFormType>({
    resolver: zodResolver(schema),
  });

  const watchTitle = watch("title");

  const { data: experienceLevels } = useExperienceLevels();
  const { data: educationLevels } = useEducationLevels();
  const { data: jobTypes } = useJobTypes();

  const { data: titles } = useJobTitles();

  const onSubmit = (data: PostJobFormType) => {
    if (skills.length === 0) {
      showErrorMessage("Please add skills");
      return;
    }

    //navigation.navigate("PostJobDetail");
    navigation.navigate("JobDescription");
    setJobPost({ ...data, skills });
  };

  // add job skill
  const onAddSkill = useCallback(() => {
    if (skillValue) {
      let prevSkills = [...skills];
      prevSkills.push(skillValue);
      setSkills(prevSkills);
      setSkillValue("");
    }
  }, [skillValue, skills]);

  //remove job skill
  const deleteSkill = useCallback(
    (data) => {
      let prevSkills = skills.filter((element) => element !== data);
      setSkills(prevSkills);
    },
    [skillValue, skills]
  );

  useEffect(() => {
    if (debouncedSearch) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [debouncedSearch]);

  return (
    <Screen backgroundColor={colors.white} edges={["top"]}>
      <ScreenHeader />

      <View
        paddingHorizontal={"large"}
        backgroundColor={"grey500"}
        paddingBottom={"medium"}
      >
        <StepIndicator stepCount={4} currentPosition={0} labels={labels} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View paddingTop={"large"} gap={"medium"} paddingHorizontal={"large"}>
          <View position={"relative"}>
            <Text paddingVertical={"small"} variant="medium14" color={"black"}>
              Title
            </Text>
            <TextInput
              placeholder="Write Title"
              placeholderTextColor={colors.grey300}
              style={{
                height: scale(49),
                backgroundColor: palette.grey500,
                borderRadius: scale(8),
                marginBottom: scale(8),
                paddingHorizontal: scale(12),
                color: colors.black,
              }}
              onChangeText={(text) => {
                setSearchQuery(text);
                setTextValue(text);
              }}
              value={value}
            />

            <AnimatePresence>
              {isVisible && (
                <TitleSearch>
                  <ScrollView
                    contentContainerStyle={{
                      paddingHorizontal: scale(12),
                      paddingVertical: scale(8),
                    }}
                    showsVerticalScrollIndicator={false}
                  >
                    <View>
                      <TouchableOpacity
                        onPress={() => {
                          setValue("title", debouncedSearch);
                          setSearchQuery("");
                          setPostJobDescription2(debouncedSearch);
                        }}
                        activeOpacity={0.6}
                      >
                        <View marginVertical={"small"}>
                          <Text color={"black"}>{debouncedSearch}</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                    {titles?.response?.data
                      ?.map((element) => {
                        return {
                          id: element?.job_title_id,
                          name: element?.job_title,
                          description: element?.job_description,
                        };
                      })
                      .map((element, index) => {
                        return (
                          <TouchableOpacity
                            onPress={() => {
                              setValue("title", element?.name);
                              setTextValue(element?.name);
                              setSearchQuery("");

                              setPostJobDescription2(element?.description);
                            }}
                            activeOpacity={0.6}
                            key={index}
                          >
                            <View marginVertical={"small"}>
                              <Text color={"black"}>{element?.name}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                  </ScrollView>
                </TitleSearch>
              )}
            </AnimatePresence>

            {/* <SelectionBox
              search={true}
              label="Title"
              placeholder="Select title"
              data={titles?.response?.data?.map((element) => {
                return {
                  id: element?.job_title_id,
                  name: element?.job_title,
                  description: element?.job_description,
                };
              })}
              onChange={(data) => {
                setValue("title", `${data?.name}`);
                setPostJobDescription2(data?.description);
              }}
            />
            {formState?.errors?.title?.message && (
              <Text paddingTop={"small"} variant="regular14" color={"error"}>
                {formState?.errors?.title?.message}
              </Text>
            )} */}

            {formState?.errors?.title?.message && (
              <Text paddingTop={"small"} variant="regular14" color={"error"}>
                {formState?.errors?.title?.message}
              </Text>
            )}
          </View>

          <View>
            <SkillsTextField
              label="Skills"
              placeholder="Enter skill"
              value={skillValue}
              onAddPress={onAddSkill}
              onChangeText={setSkillValue}
            />
            {skills?.length ? (
              <View
                flexDirection={"row"}
                gap={"small"}
                flexWrap={"wrap"}
                paddingTop={"medium"}
              >
                {skills?.map((element, index) => {
                  return (
                    <View
                      key={index}
                      backgroundColor={"grey500"}
                      paddingHorizontal={"medium"}
                      paddingVertical={"small"}
                      borderRadius={scale(18)}
                      flexDirection={"row"}
                      alignItems={"center"}
                    >
                      <Text>{element}</Text>
                      <Pressable onPress={() => deleteSkill(element)}>
                        <Image
                          source={icons.close}
                          style={{ height: 18, width: 18, marginLeft: 10 }}
                        />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>

          <View>
            <SelectionBox
              label="Job Type"
              placeholder="Select job type"
              data={jobTypes}
              onChange={(data) => {
                setValue("jobType", `${data?.id},${data?.name}`);
              }}
            />
            {formState?.errors?.jobType?.message && (
              <Text paddingTop={"small"} variant="regular14" color={"error"}>
                {formState?.errors?.jobType?.message}
              </Text>
            )}
          </View>

          <View>
            <SelectionBox
              label="Education"
              data={educationLevels}
              placeholder="Select education"
              onChange={(data) => {
                setValue("education", `${data?.id},${data?.name}`);
              }}
            />
            {formState?.errors?.education?.message && (
              <Text paddingTop={"small"} variant="regular14" color={"error"}>
                {formState?.errors?.education?.message}
              </Text>
            )}
          </View>

          <View>
            <SelectionBox
              label="Experience level"
              placeholder="Select experience"
              data={experienceLevels}
              onChange={(data) => {
                setValue("experience", `${data?.id},${data?.name}`);
              }}
            />
            {formState?.errors?.experience?.message && (
              <Text paddingTop={"small"} variant="regular14" color={"error"}>
                {formState?.errors?.experience?.message}
              </Text>
            )}
          </View>
        </View>

        <View
          paddingVertical={"large"}
          marginTop={"large"}
          borderTopWidth={1}
          borderTopColor={"grey400"}
        >
          <Button
            label="Next"
            marginHorizontal={"large"}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: scale(100),
  },
});
