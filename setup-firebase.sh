#!/bin/bash

# Firebase Setup Script for DoTogether Habit Tracker
# This script helps you set up Firebase for your project

echo "🔥 Firebase Setup for DoTogether"
echo "================================"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
else
    echo "✅ Firebase CLI is already installed"
fi

# Check if user is logged in
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "🔑 Please log in to Firebase:"
    firebase login
else
    echo "✅ Already logged in to Firebase"
fi

# Set the project
PROJECT_ID="dotogether-c0b18"
echo "🎯 Setting Firebase project to: $PROJECT_ID"
firebase use $PROJECT_ID

# Initialize Firebase features if not already done
if [ ! -f ".firebaserc" ]; then
    echo "🚀 Initializing Firebase project..."
    firebase init firestore storage hosting --project $PROJECT_ID
else
    echo "✅ Firebase project already initialized"
fi

# Deploy rules and indexes
echo "📋 Deploying Firestore rules and indexes..."
firebase deploy --only firestore:rules,firestore:indexes

echo "💾 Deploying Storage rules..."
firebase deploy --only storage

echo ""
echo "🎉 Firebase setup complete!"
echo ""
echo "📊 Next steps:"
echo "1. Visit Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID"
echo "2. Enable Authentication providers (Email/Password)"
echo "3. Set up billing if you need more than free tier limits"
echo "4. Configure any additional settings in the console"
echo ""
echo "🚀 To start development:"
echo "   npm run dev"
echo ""
echo "🧪 To test with emulators:"
echo "   npm run firebase:emulator"
echo ""
echo "📤 To deploy your app:"
echo "   npm run build && firebase deploy"