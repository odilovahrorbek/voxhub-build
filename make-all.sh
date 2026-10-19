#!/bin/bash
set -e

RAW_NAME=$(basename "$PWD")
APP_NAME=${1:-"$RAW_NAME"}
CLEAN_NAME=$(echo "$APP_NAME" | tr -cd '[:alnum:]' | tr '[:upper:]' '[:lower:]')

echo "=========================================="
echo "🤖 1-BOSQICH: [$APP_NAME] uchun APK yig'ilmoqda..."
echo "=========================================="
rm -rf android dist node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
npx cap add android
npx cap sync android
echo "sdk.dir=$HOME/Android/Sdk" > android/local.properties
cd android
chmod +x gradlew
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ./gradlew clean assembleDebug
cd ..
cp android/app/build/outputs/apk/debug/app-debug.apk ./${CLEAN_NAME}.apk
echo "✅ TOZA APK TAYYOR: ${CLEAN_NAME}.apk"

echo "=========================================="
echo "🍎 2-BOSQICH: [$APP_NAME] uchun IPA yig'ilmoqda..."
echo "=========================================="

if [ ! -d "node_modules/@capacitor/ios" ]; then
  npm install @capacitor/ios --legacy-peer-deps
fi

rm -rf ios
npx cap add ios
npx cap copy ios

mkdir -p .github/workflows
cat << 'YAML' > .github/workflows/ios-build.yml
name: Build iOS IPA
on:
  push:
    branches: [ main ]
  workflow_dispatch:
jobs:
  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Prepare Dependencies & Sync
        run: |
          rm -rf node_modules package-lock.json
          npm install --legacy-peer-deps
          npx cap copy ios
      - name: Install CocoaPods
        run: |
          cd ios/App
          if [ -f "Podfile" ]; then pod install; fi
      - name: Compile Unsigned iOS App
        run: |
          cd ios/App
          if [ -d "App.xcworkspace" ]; then
            xcodebuild -workspace App.xcworkspace \
              -scheme App \
              -configuration Release \
              -sdk iphoneos \
              -derivedDataPath build \
              CODE_SIGN_IDENTITY="" \
              CODE_SIGNING_REQUIRED=NO \
              CODE_SIGNING_ALLOWED=NO \
              clean build
          else
            xcodebuild -project App.xcodeproj \
              -scheme App \
              -configuration Release \
              -sdk iphoneos \
              -derivedDataPath build \
              CODE_SIGN_IDENTITY="" \
              CODE_SIGNING_REQUIRED=NO \
              CODE_SIGNING_ALLOWED=NO \
              clean build
          fi
      - name: Create IPA Archive
        run: |
          mkdir -p Payload
          cp -r ios/App/build/Build/Products/Release-iphoneos/App.app Payload/
          zip -qq -r app.ipa Payload
      - name: Upload Artifact
        uses: actions/upload-artifact@v4
        with:
          name: ios-ipa
          path: app.ipa
YAML

if [ ! -d ".git" ]; then
  git init
  git branch -M main
fi

cat << 'GITIGNORE' > .gitignore
node_modules/
build/
android/
*.apk
*.ipa
GITIGNORE

git config user.email "dev@local.app" || true
git config user.name "Developer" || true
git add .
git commit -m "Build direct IPA for $APP_NAME" || true

if ! git remote | grep -q origin; then
  gh repo create "${CLEAN_NAME}-build" --public --source=. --remote=origin --push
else
  git push -u origin main --force
fi

echo "⏳ GitHub Actions ishga tushishi kutilmoqda (7 soniya)..."
sleep 7

RUN_ID=$(gh run list --workflow=ios-build.yml --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$RUN_ID"

rm -rf /tmp/ipa_download
gh run download "$RUN_ID" -n ios-ipa -D /tmp/ipa_download
mv /tmp/ipa_download/app.ipa "./${CLEAN_NAME}.ipa"

echo "✅ TAYYOR! APK: ${CLEAN_NAME}.apk | IPA: ${CLEAN_NAME}.ipa"