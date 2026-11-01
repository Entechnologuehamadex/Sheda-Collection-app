import { FlatList, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ProjectCard from "@/components/ProjectCard";
import { InterBold, InterRegular, InterSemiBold } from "@/components/Text";
import { COLORS } from "@/constants/theme";
import { SAMPLE_PROJECTS } from "@/services/projects";

/**
 * Raises open for investment.
 *
 * Opens on real content rather than a prompt to connect a wallet: someone
 * deciding whether this is worth their money has not decided to sign
 * anything yet, and asking them to first is how a browse screen stops being
 * browsed.
 */
export default function Invest() {
  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: COLORS.background }}>
      <FlatList
        data={SAMPLE_PROJECTS}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 18, gap: 10 }}>
            <View>
              <InterBold style={{ fontSize: 22, color: COLORS.primaryText }}>
                Back a building
              </InterBold>
              <InterRegular
                style={{ fontSize: 13, color: COLORS.secondaryText, marginTop: 4, lineHeight: 19 }}
              >
                Put money into a development before it is built, and earn a share of the rent once
                it is let.
              </InterRegular>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => router.push("/holdings")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: COLORS.primaryLight,
                borderRadius: 10,
                padding: 14,
              }}
            >
              <View>
                <InterSemiBold style={{ fontSize: 14, color: COLORS.primary }}>
                  Your holdings
                </InterSemiBold>
                <InterRegular style={{ fontSize: 11, color: COLORS.secondaryText, marginTop: 1 }}>
                  Units you hold, and rent ready to claim
                </InterRegular>
              </View>
              <InterSemiBold style={{ fontSize: 18, color: COLORS.primary }}>›</InterSemiBold>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <ProjectCard project={item} onPress={() => router.push(`/project/${item.id}`)} />
        )}
        ListFooterComponent={
          <InterRegular
            style={{
              fontSize: 11,
              color: COLORS.secondaryText,
              textAlign: "center",
              marginTop: 8,
              lineHeight: 17,
            }}
          >
            Returns shown are each builder&apos;s own estimate. Sheda does not verify them and does
            not guarantee any return.
          </InterRegular>
        }
      />
    </SafeAreaView>
  );
}
