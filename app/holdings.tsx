import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "@/components/Button";
import { InterBold, InterMedium, InterRegular, InterSemiBold } from "@/components/Text";
import { COLORS, RADIUS } from "@/constants/theme";
import { bpsToPercent, naira, ownershipBps } from "@/services/money";
import { custodyState, getHolding, type Holding } from "@/services/vault";

/**
 * What you hold, and what is waiting for you.
 *
 * Vacancy is shown as plainly as income. A unit earning nothing this month
 * is the thing a holder most needs to know and the thing a portfolio screen
 * most often hides behind a total.
 */

/** Vaults to read. Replaced by a per-account index when stage 3 lands. */
const WATCHED_VAULTS: string[] = [];

export default function Holdings() {
  const [accountId] = useState<string | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accountId || WATCHED_VAULTS.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled(
        WATCHED_VAULTS.map((vaultId) => getHolding(vaultId, accountId))
      );
      const ok = results
        .filter((r): r is PromiseFulfilledResult<Holding> => r.status === "fulfilled")
        .map((r) => r.value)
        .filter((h) => BigInt(h.balance || "0") > 0n);
      setHoldings(ok);
      // Partial failure is reported rather than hidden: a holding missing
      // from this list because one read failed would look like a holding
      // that no longer exists.
      if (results.some((r) => r.status === "rejected")) {
        setError("Some vaults could not be read. Pull to try again.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach the network.");
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    load();
  }, [load]);

  const totalClaimable = holdings.reduce((sum, h) => sum + BigInt(h.claimable || "0"), 0n);

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.primary} />}
      >
        <View
          style={{
            backgroundColor: COLORS.primaryLight,
            borderRadius: RADIUS,
            padding: 16,
            gap: 12,
          }}
        >
          <View>
            <InterRegular style={{ fontSize: 12, color: COLORS.secondaryText }}>
              Rent ready to claim
            </InterRegular>
            <InterBold style={{ fontSize: 28, color: COLORS.primary, marginTop: 2 }}>
              {naira(totalClaimable.toString())}
            </InterBold>
          </View>
          <Button
            label="Claim"
            disabled={totalClaimable === 0n}
            onPress={() => {
              // Claiming signs against each vault. Wired with the wallet in
              // stage 7; the amount above is already read from the chain.
            }}
          />
        </View>

        {error ? (
          <View style={{ backgroundColor: COLORS.cautionLight, borderRadius: 10, padding: 12 }}>
            <InterMedium style={{ fontSize: 12, color: COLORS.caution, lineHeight: 18 }}>
              {error}
            </InterMedium>
          </View>
        ) : null}

        {loading && holdings.length === 0 ? (
          <View style={{ paddingVertical: 36, alignItems: "center" }}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : holdings.length === 0 ? (
          <Empty connected={Boolean(accountId)} />
        ) : (
          holdings.map((h) => <HoldingRow key={h.vaultId} holding={h} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Empty({ connected }: { connected: boolean }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        borderStyle: "dashed",
        borderRadius: RADIUS,
        padding: 22,
        alignItems: "center",
        gap: 6,
      }}
    >
      <InterSemiBold style={{ fontSize: 14, color: COLORS.primaryText }}>
        {connected ? "You do not hold any units yet" : "Connect a wallet to see your holdings"}
      </InterSemiBold>
      <InterRegular
        style={{ fontSize: 12, color: COLORS.secondaryText, textAlign: "center", lineHeight: 18 }}
      >
        {connected
          ? "Back a raise and your share of its rent will appear here once the building is let."
          : "Your units, the rent they have earned and anything ready to claim will show here."}
      </InterRegular>
    </View>
  );
}

function HoldingRow({ holding }: { holding: Holding }) {
  const { info, balance, claimable } = holding;
  const state = custodyState(info.custody);
  const share = ownershipBps(balance, info.total_supply);

  const status =
    state === "awaiting"
      ? { text: "Still being built", tone: COLORS.caution, bg: COLORS.cautionLight }
      : state === "redeemed"
        ? { text: "Redeemed", tone: COLORS.secondaryText, bg: COLORS.cardBackground }
        : BigInt(claimable || "0") > 0n
          ? { text: "Earning", tone: COLORS.positive, bg: COLORS.positiveLight }
          : { text: "No rent yet this period", tone: COLORS.caution, bg: COLORS.cautionLight };

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        borderRadius: RADIUS,
        padding: 14,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
        <View style={{ flexShrink: 1 }}>
          <InterSemiBold style={{ fontSize: 14, color: COLORS.primaryText }}>
            {info.name}
          </InterSemiBold>
          <InterRegular style={{ fontSize: 11, color: COLORS.secondaryText, marginTop: 1 }}>
            {balance} shares · {bpsToPercent(share)} of the unit
          </InterRegular>
        </View>
        <View style={{ backgroundColor: status.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignSelf: "flex-start" }}>
          <InterSemiBold style={{ fontSize: 10, color: status.tone }}>{status.text}</InterSemiBold>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Cell label="Ready to claim" value={naira(claimable)} />
        <Cell label="Managed by" value={info.manager} />
      </View>
    </View>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cardBackground, borderRadius: 8, padding: 10 }}>
      <InterRegular style={{ fontSize: 10, color: COLORS.secondaryText }}>{label}</InterRegular>
      <InterMedium style={{ fontSize: 12, color: COLORS.primaryText, marginTop: 2 }} numberOfLines={1}>
        {value}
      </InterMedium>
    </View>
  );
}
