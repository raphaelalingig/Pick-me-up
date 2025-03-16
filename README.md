# PickMeUp - Mobile Application (React Native)

This repository contains the React Native mobile application for PickMeUp.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- JDK 11 or higher

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Jundy25/Pick-me-up.git
cd Pick-me-up
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following contents:
```
MAPS_API_KEY=your_google_maps_api_key
```

4. Start the Metro bundler:
```bash
npx react-native start
# or
yarn start
```

5. Run the application:

For Android:
```bash
npx react-native run-android
# or
yarn android
```

For iOS (macOS only):
```bash
npx react-native run-ios
# or
yarn ios
```

## Environment Setup

### Android Setup
- Make sure you have Android Studio installed
- Install the necessary SDKs through Android Studio's SDK Manager
- Set up an Android Virtual Device (AVD) or connect a physical device

### iOS Setup (macOS only)
- Make sure you have Xcode installed
- Install CocoaPods: `sudo gem install cocoapods`
- Install iOS dependencies: `cd ios && pod install && cd ..`

## Credentials

### Test User Accounts
- Regular User:
  - Username: `sony`
  - Password: `sony`
- Driver:
  - Username: `mark`
  - Password: `mark`

## API Configuration

The mobile app connects to the backend API. Make sure your backend server is running and the `API_URL` in your `API_URL` file points to the correct address.

## Google Maps Integration

This application uses Google Maps for location services. To set up Google Maps:

1. Obtain a Google Maps API key from the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs in your Google Cloud project:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
   - Directions API
   - Geocoding API
3. Add your API key to the `.env` file as shown above


## Troubleshooting

- If you encounter issues with dependencies, try clearing the cache:
  ```bash
  npm cache clean --force
  # or
  yarn cache clean
  ```

- For iOS build issues, try cleaning the build folder:
  ```bash
  cd ios && xcodebuild clean && cd ..
  ```

- For Android build issues, try:
  ```bash
  cd android && ./gradlew clean && cd ..
  ```

## Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)
