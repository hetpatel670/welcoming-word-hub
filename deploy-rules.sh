#!/bin/bash

# Firebase Rules Deployment Script
# This script deploys Firestore security rules and indexes to your Firebase project

echo "🔥 Firebase Rules Deployment Script"
echo "=================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Check if user is logged in
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "🔑 Please log in to Firebase:"
    firebase login
fi

# Set the project (replace with your project ID)
PROJECT_ID="dotogether-c0b18"
echo "🎯 Setting Firebase project to: $PROJECT_ID"
firebase use $PROJECT_ID

# Deploy Firestore rules
echo "📋 Deploying Firestore security rules..."
firebase deploy --only firestore:rules

# Deploy Firestore indexes
echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

# Deploy Storage rules
echo "💾 Deploying Storage security rules..."
firebase deploy --only storage

echo "✅ All rules deployed successfully!"
echo ""
echo "🔍 You can view your rules in the Firebase Console:"
echo "   https://console.firebase.google.com/project/$PROJECT_ID/firestore/rules"
echo "   https://console.firebase.google.com/project/$PROJECT_ID/storage/rules"
echo ""
echo "📊 View indexes at:"
echo "   https://console.firebase.google.com/project/$PROJECT_ID/firestore/indexes"