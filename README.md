# Car Showroom App — Interactive UI Build

## What's new in this version

Full navigation, four real screens, working forms, press animations, and
haptic feedback — all on mock data, ready to wire to a real backend later.

```
src/
  theme/
    tokens.ts              → color, spacing, radius tokens (light + dark)
    ThemeProvider.tsx       → auto-switches based on phone's system setting
    navigationTheme.ts      → bridges tokens into React Navigation
  components/
    AnimatedPressable.tsx    → scale + haptic press wrapper, used everywhere
    Card.tsx                 → base surface with optional metallic sheen
    StatTile.tsx              → tappable dashboard stat cards
    Button.tsx                 → primary / secondary / ghost variants
    ActivityRow.tsx              → tappable activity/list row
    StatusBadge.tsx                → Available / Reserved / Sold pill
    SearchBar.tsx                   → search input with icon
    FilterChips.tsx                  → horizontal filter chip row
    MetallicSheen.tsx                 → signature gold gradient hairline
  screens/
    DashboardScreen.tsx       → stat tiles + activity feed, all tappable
    CarsScreen.tsx              → searchable, filterable car inventory list
    CarDetailScreen.tsx          → full car specs + status update buttons
    CustomersScreen.tsx           → searchable customer list
    CustomerDetailScreen.tsx       → contact info + balance
    TransactionsScreen.tsx          → cash in/out history + add buttons
    AddTransactionScreen.tsx          → working form with validation
  navigation/
    types.ts                  → typed navigation params (TypeScript safety)
    RootNavigator.tsx           → bottom tabs nested in a root stack
  data/
    mockData.ts                 → cars, customers, transactions, dashboard stats
```

## IMPORTANT — exact dependency versions

This project is pinned to **exact** versions (no `^` or `~` ranges) for every
Expo-related package, matching the SDK 55 build of Expo Go you already have
working on your phone:

```
expo: 55.0.0
expo-haptics: 55.0.0
expo-linear-gradient: 55.0.14
expo-status-bar: 55.0.6
react: 19.2.0
react-native: 0.83.6
```

Do **not** run `npx expo install <package>` to add anything new without
checking it resolves to a 55.x version afterward — npm/Expo's installer can
silently pull the newest SDK (56) for a single package and break the match
with your phone's Expo Go. If you ever add a package, run `cat package.json`
afterward and check nothing changed to a 56.x version unexpectedly.

## Run it on your phone

```bash
cd car-showroom-app
npm install
npx expo start -c
```

Scan the QR with Expo Go. Try switching your phone's system theme — the
whole app should re-theme automatically.

## What's interactive right now (all on mock data)

- Dashboard stat tiles are tappable → jump to Transactions or Cars
- Recent activity rows are tappable → jump to the relevant screen
- "Customers with balance due" rows → jump to that customer's detail page
- Cars screen: live search + status filter chips (Available/Reserved/Sold)
- Tapping a car → detail screen with tappable status buttons (Available →
  Reserved → Sold) and a "Record Sale" button
- Customers screen: live search by name or phone
- Transactions screen: All/Cash In/Cash Out toggle, plus two buttons that
  open a real Add Transaction form
- Add Transaction form: amount field, category chips, notes, validates that
  an amount was entered, shows a loading state, then a success confirmation
- Every tap gives a light haptic buzz and a subtle scale-down animation —
  this is what makes it feel responsive rather than static

## What to do next

- Swap `mockData.ts` reads for real API calls once the FastAPI backend
  exists — none of the components know or care where data comes from
- Add a real Login screen in front of the tab navigator
- Add pull-to-refresh on the list screens
- Persist the Add Transaction form's submission into actual app state
  (currently it just shows a success alert and discards the data)
