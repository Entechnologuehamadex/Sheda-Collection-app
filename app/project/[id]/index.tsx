import { ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "@/components/Button";
import { InterBold, InterMedium, InterRegular, InterSemiBold } from "@/components/Text";
import { COLORS, RADIUS } from "@/constants/theme";
import { naira } from "@/services/money";
import { getProject, type DocumentStatus, type Phase } from "@/services/projects";

/**
 * Everything someone needs before committing money.
 *
 * Under an open-market model the investor carries the judgement, so this
 * screen owes them the material to make it: who is asking, what has been
 * checked, what has not, and what they have delivered before. An unverified
 * document is shown as loudly as a verified one — a blank reads as approval.
 */
export default function ProjectDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const project = getProject(String(id));

  if (!project) {
    return (
      <SafeAreaView edges={["bottom"]} style={{ flex: 1, padding: 20 }}>
        <InterSemiBold style={{ fontSize: 15 }}>We could not find that project.</InterSemiBold>
        <InterRegular style={{ fontSize: 13, color: COLORS.secondaryText, marginTop: 6 }}>
          It may have closed. Go back and pick another.
        </InterRegular>
      </SafeAreaView>
    );
  }

  const covered = project.guaranteeBps > 0;

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 28, gap: 20 }}>
        <View>
          <InterBold style={{ fontSize: 21, color: COLORS.primaryText }}>{project.name}</InterBold>
          <InterRegular style={{ fontSize: 13, color: COLORS.secondaryText, marginTop: 3 }}>
            {project.location} · {project.units} units
          </InterRegular>
          <InterRegular
            style={{ fontSize: 13, color: COLORS.primaryText, marginTop: 10, lineHeight: 20 }}
          >
            {project.description}
          </InterRegular>
        </View>

        <Section title="The raise">
          <Row label="Target" value={naira(project.target, 0)} />
          <Row label="Raised so far" value={naira(project.raised, 0)} />
          <Row label="Closes in" value={`${project.daysLeft} days`} />
          <Row
            label="Estimated return"
            value={`${project.estimatedReturnPct}% a year`}
            note="The builder's own figure. Sheda does not verify it."
          />
          <Row
            label="Completion guarantee"
            value={covered ? `${(project.guaranteeBps / 100).toFixed(0)}% of what you put in` : "None offered"}
            note={
              covered
                ? "Returned to you if the build stalls below half-finished. It is a share of your money, not all of it."
                : "If this build stalls you recover only what has not already been spent."
            }
            tone={covered ? "positive" : "caution"}
          />
        </Section>

        <Section title="Who is building this">
          <Row label="Builder" value={project.builder} />
          <Row
            label="Property manager"
            value={project.manager}
            note={
              project.builderIsManager
                ? "Same group as the builder, so they may not sign off their own construction phases. An independent reviewer is required before any money is released."
                : "Independent of the builder, so they may sign off construction phases."
            }
            tone={project.builderIsManager ? "caution" : "positive"}
          />
          <Row
            label="Track record"
            value={`${project.record.completed} completed · ${project.record.late} late · ${project.record.abandoned} abandoned`}
            note="Counted from on-chain events, not self-reported."
          />
        </Section>

        <Section title="Documents">
          {project.documents.map((doc) => (
            <DocumentRow key={doc.label} label={doc.label} status={doc.status} />
          ))}
        </Section>

        <Section title="How the money is released">
          {project.phases.map((phase, index) => (
            <PhaseRow key={phase.name} phase={phase} index={index} />
          ))}
          <InterRegular
            style={{ fontSize: 11, color: COLORS.secondaryText, marginTop: 4, lineHeight: 17 }}
          >
            Each phase is inspected and signed off before its money is released. Holders have seven
            days to object, and a quarter of them objecting holds the payment.
          </InterRegular>
        </Section>

        <Button label="Choose a unit" onPress={() => router.push(`/project/${project.id}/units`)} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <InterSemiBold style={{ fontSize: 15, color: COLORS.primaryText }}>{title}</InterSemiBold>
      <View
        style={{
          borderWidth: 1,
          borderColor: COLORS.borderColor,
          borderRadius: RADIUS,
          padding: 14,
          gap: 12,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  note,
  tone = "plain",
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "plain" | "positive" | "caution";
}) {
  const colour =
    tone === "positive" ? COLORS.positive : tone === "caution" ? COLORS.caution : COLORS.primaryText;
  return (
    <View style={{ gap: 2 }}>
      <InterRegular style={{ fontSize: 11, color: COLORS.secondaryText }}>{label}</InterRegular>
      <InterSemiBold style={{ fontSize: 14, color: colour }}>{value}</InterSemiBold>
      {note ? (
        <InterRegular style={{ fontSize: 11, color: COLORS.secondaryText, lineHeight: 17 }}>
          {note}
        </InterRegular>
      ) : null}
    </View>
  );
}

const DOC_LABEL: Record<DocumentStatus, string> = {
  verified: "Verified by Sheda",
  uploaded: "Uploaded, not verified",
  missing: "Not provided",
};

function DocumentRow({ label, status }: { label: string; status: DocumentStatus }) {
  const tone =
    status === "verified"
      ? { fg: COLORS.positive, bg: COLORS.positiveLight }
      : status === "uploaded"
        ? { fg: COLORS.caution, bg: COLORS.cautionLight }
        : { fg: COLORS.primary, bg: COLORS.active };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <InterMedium style={{ fontSize: 13, color: COLORS.primaryText, flexShrink: 1 }}>
        {label}
      </InterMedium>
      <View style={{ backgroundColor: tone.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
        <InterSemiBold style={{ fontSize: 10, color: tone.fg }}>{DOC_LABEL[status]}</InterSemiBold>
      </View>
    </View>
  );
}

function PhaseRow({ phase, index }: { phase: Phase; index: number }) {
  const done = phase.status === "done";
  const current = phase.status === "current";
  const colour = done ? COLORS.positive : current ? COLORS.primary : COLORS.secondaryText;

  return (
    <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: done ? COLORS.positiveLight : current ? COLORS.active : COLORS.cardBackground,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 1,
        }}
      >
        <InterSemiBold style={{ fontSize: 10, color: colour }}>
          {done ? "✓" : String(index + 1)}
        </InterSemiBold>
      </View>
      <View style={{ flex: 1 }}>
        <InterMedium style={{ fontSize: 13, color: COLORS.primaryText }}>{phase.name}</InterMedium>
        <InterRegular style={{ fontSize: 11, color: COLORS.secondaryText, marginTop: 1 }}>
          {(phase.tranche / 100).toFixed(0)}% of the raise
          {phase.attestedBy ? ` · signed off by ${phase.attestedBy}` : ""}
          {current ? " · in progress" : ""}
        </InterRegular>
      </View>
    </View>
  );
}
