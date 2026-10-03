# News & Stocks

A personal news, stocks, sports-scores and weather dashboard. React Native, with a web build via
`react-native-web` + webpack.

## Web deployment (Vercel)

The web build is a static site (`npm run build:web` -> `dist/`) plus four small serverless functions in
`api/`. The browser never talks to NewsAPI, Yahoo or ESPN directly, and the bundle contains **no API keys**:

| Route | Upstream | Notes |
| --- | --- | --- |
| `/api/news` | NewsAPI (`top-headlines`, `everything`) | Adds `NEWS_API_KEY` on the server; CDN-cached 10 min (free plan = 100 requests/day) |
| `/api/yahoo` | Yahoo Finance chart | Symbol/range validated; CDN-cached 30 s |
| `/api/espn` | ESPN scoreboards | League allowlist. ESPN no longer accepts date ranges, so a range is split into single days and merged (today cached 30 s, later days 10 min) |

User-added RSS feeds are still fetched straight from the browser (many sites block that with CORS); a
proxy for them would be an open fetch-any-URL endpoint, so it was left out on purpose.

**Environment variable:** `NEWS_API_KEY` (Vercel project settings, or `.env` for local dev). Nothing else is needed.

**Local dev:** `npm ci`, then `npm run web` (http://localhost:9090). The dev server serves the same `api/*.js`
files that Vercel runs.

**Deploy:** pushes to `main` deploy through Vercel's GitHub integration once it is connected; otherwise
`vercel --prod` from this directory. This replaced the earlier GitHub Pages deployment, which had to compile
the keys into the public bundle.

---

## React Native (native apps)

This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
