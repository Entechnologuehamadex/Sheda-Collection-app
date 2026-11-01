# Sheda Collections

Backing a building before it is built, and earning a share of its rent once
it is let.

Kept apart from the rental app on purpose. That app has real users and a
working contract behind it; this is stage 7 of [the build spec][spec] being
developed where it cannot destabilise them. It folds in as an **Invest** tab
once the flows hold up.

[spec]: https://claude.ai/artifact/9ttLG6SjqLLK5SV5dEtt47

The vault contract these screens read lives in
[sheda-collection-app-contract](https://github.com/Entechnologuehamadex/sheda-collection-app-contract).

---

## Running it

```bash
npm install
npm start          # then a for Android, i for iOS, w for web
npm test           # the money arithmetic
npm run typecheck
```

Nothing needs configuring to start. It reads the same testnet marketplace and
stablecoin the rental app uses — `app.json` under `extra` is the one place to
change that.

## Built to be merged, not ported

Every version is pinned to what the rental app already resolves: Expo 57,
React Native 0.86.0, React 19.2.3, NativeWind 4, expo-router. The Tailwind
tokens are the same Sheda values, and `components/Text.tsx` has the same
shape as that app's `components/Text/*`, so a screen moves across with only
its import paths changing.

Two colours exist here that do not exist there — `positive` and `caution`.
A raise has to say whether a guarantee exists and whether a phase passed,
and the brand red cannot mean both "Sheda" and "something is wrong".

## What is here

| Route | Does |
| --- | --- |
| `/` | Raises open for investment |
| `/project/[id]` | Who is building it, what is verified, how money is released |
| `/project/[id]/units` | Pick a flat, choose an amount, see what you get |
| `/holdings` | Units held, rent ready to claim |

```
services/money.ts      amounts, shares, ownership — BigInt throughout
services/vault.ts      reading vaults over JSON-RPC
services/projects.ts   project shapes, with sample data until stage 3
components/            Text, Button, ProjectCard
constants/theme.ts     the palette, for props Tailwind cannot reach
```

## Decisions worth knowing

**Money never touches `Number`.** Every amount is an integer string handled
as `BigInt`. Above 2^53 a JavaScript number stops being exact, and atomic
units reach that easily — a price of ₦18m is `18000000000000`. Rounding there
is how an app ends up showing a holder a figure the chain disagrees with.
`parseMoney` refuses more precision than the coin has rather than silently
truncating, because truncation is a rounding decision taken on someone's
behalf.

**Ownership is computed the way the contract computes it.** The vault exposes
`ownership_bps`; `money.ts` reproduces it exactly. Two implementations of the
same division is two numbers for the same holding.

**Base64 is written out.** Neither `btoa` nor Node's `Buffer` is reliably
present across React Native, Hermes and the web build. Depending on either
gives a call that works in the simulator and throws on a device.

**RPC falls through its endpoints** and remembers which one answered. A single
unreachable provider should cost speed, not function — the rental app learned
that when a deprecated endpoint began refusing everything.

**Browsing needs no wallet.** Someone deciding whether this is worth their
money has not decided to sign anything. Asking first is how a browse screen
stops being browsed.

## What the screens are careful about

These come from the risk register and are the reason some text reads the way
it does.

- **The projected return is labelled as the builder's figure** wherever it
  appears. The moment a platform displays a projection unattributed it is
  endorsing it.
- **"No guarantee" is printed, never left blank.** An empty space where a
  cover figure belongs reads as reassurance.
- **Cover is restated in money at the point of commitment.** 18% is abstract
  while someone is deciding; ₦45,000 of ₦250,000 is not.
- **An unverified document is as prominent as a verified one.** Under an open
  market the investor carries the judgement, so they are owed the material to
  make it.
- **A builder managing their own build is flagged on the project page**, with
  the reason: they may hold the mandate but may not sign off their own
  construction phases.
- **Vacancy is shown as plainly as income.** A unit earning nothing is what a
  holder most needs to know and what a portfolio screen most often hides
  behind a total.
- **A share is described as a claim on rent, not as title.**

## Not wired yet

Signing. Committing to a raise and claiming rent both read correctly and
compute correctly, and neither submits a transaction — the raise contract is
stage 3 and the wallet is stage 7. The arithmetic and the disclosure are the
parts that have to be right first, and they are testable without a wallet.

`services/projects.ts` carries sample projects shaped exactly like the
contract's eventual return, so the screens are written against the real
interface rather than a placeholder that would need unpicking.

Also absent: the Raise flow for builders, the manager's mandate and
attestation screens, voting, and the share market. Sections 03 and 05 of the
spec have their wireframes.

## Testing

```bash
npm test
```

Thirteen tests over the money arithmetic: grouping and trimming, a figure
larger than a JavaScript number can hold, what a stake buys and the round
trip back, rounding down below one share, division by zero, and ownership in
basis points matching the contract.

The screens are not snapshot-tested. Snapshots of a layout still moving
record what it happens to be rather than what it must be, and they fail on
every honest change. They become worth adding once the flows settle.

## Licence

Unpublished. All rights reserved by Sheda Solutions.
