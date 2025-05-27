# Firebase Setup Guide for DoTogether Habit Tracker

## 🔥 Firebase Configuration

Your Firebase project is configured with the following details:
- **Project ID**: `dotogether-c0b18`
- **Auth Domain**: `dotogether-c0b18.firebaseapp.com`
- **Storage Bucket**: `dotogether-c0b18.firebasestorage.app`

## 📋 Security Rules

### Firestore Rules (`firestore.rules`)
The Firestore security rules ensure:
- ✅ Users can only access their own data
- ✅ Public profiles are readable by authenticated users
- ✅ Username uniqueness is enforced
- ✅ Data validation for tasks and user profiles
- ✅ Proper authentication checks

### Storage Rules (`storage.rules`)
The Storage security rules provide:
- ✅ User profile picture uploads (5MB limit)
- ✅ Image file type validation
- ✅ User-specific access control
- ✅ Public asset access for authenticated users

## 🗄️ Database Structure

```
/users/{username}
├── email: string
├── username: string
├── isPublicProfile: boolean
├── points: number
├── currentStreak: number
├── /tasks/{taskId}
│   ├── name: string
│   ├── category: string
│   ├── isCompleted: boolean
│   ├── createdAt: timestamp
│   └── reminderTime: timestamp (optional)
├── /streaks/{streakId}
│   ├── currentStreak: number
│   └── lastCompletedDate: timestamp
└── /badges/{badgeId}
    ├── name: string
    ├── description: string
    └── earnedAt: timestamp
```

## 🚀 Deployment Instructions

### Option 1: Automatic Deployment
Run the deployment script:
```bash
./deploy-rules.sh
```

### Option 2: Manual Deployment
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Set your project:
   ```bash
   firebase use dotogether-c0b18
   ```

4. Deploy rules:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   firebase deploy --only storage
   ```

## 📊 Indexes

The following indexes are configured for optimal query performance:

1. **Public Profiles by Points**: `isPublicProfile ASC, points DESC`
2. **Public Profiles by Streak**: `isPublicProfile ASC, currentStreak DESC`
3. **Tasks by Completion**: `isCompleted ASC, createdAt DESC`
4. **Tasks by Category**: `category ASC, createdAt DESC`
5. **Tasks by Reminder**: `reminderTime ASC, isCompleted ASC`

## 🔐 Authentication Flow

1. **User Registration**: Creates Firebase Auth user
2. **Username Setup**: Creates Firestore user document with username as ID
3. **Profile Creation**: Initializes user data and streak tracking
4. **Data Access**: All subsequent operations use username-based document IDs

## 🛡️ Security Features

- **Email Verification**: Users must verify their email addresses
- **Username Validation**: Usernames must be 3+ characters, alphanumeric + underscores
- **Data Isolation**: Users can only access their own data
- **Public Profile Control**: Users can choose to make profiles public
- **File Upload Security**: Image validation and size limits
- **Rate Limiting**: Firebase automatically handles rate limiting

## 🔧 Environment Variables

Ensure your `.env` file contains:
```env
VITE_FIREBASE_API_KEY=AIzaSyAhV6m8RZSu3erC_zKYOMyrfSyDmyxmLTw
VITE_FIREBASE_AUTH_DOMAIN=dotogether-c0b18.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dotogether-c0b18
VITE_FIREBASE_STORAGE_BUCKET=dotogether-c0b18.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=52364021580
VITE_FIREBASE_APP_ID=1:52364021580:web:2dfb4a01dcab82862e09e9
VITE_FIREBASE_MEASUREMENT_ID=G-0L7W6M722D
```

## 📈 Analytics

Firebase Analytics is configured to track:
- User authentication events
- Task creation and completion
- Streak milestones
- Badge achievements
- Page navigation
- User engagement metrics

## 🚨 Troubleshooting

### Common Issues:

1. **Permission Denied Errors**
   - Ensure user is authenticated
   - Check that username matches document ID
   - Verify email matches authenticated user

2. **Username Already Taken**
   - The app checks username availability before creation
   - Try a different username if validation fails

3. **File Upload Errors**
   - Ensure file is an image type
   - Check file size is under 5MB
   - Verify user is authenticated

4. **Index Errors**
   - Deploy indexes using `firebase deploy --only firestore:indexes`
   - Wait for indexes to build (can take several minutes)

## 📞 Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/project/dotogether-c0b18)
- [Firebase Support](https://firebase.google.com/support)

## 🔄 Updates

To update rules after changes:
1. Modify the rule files (`firestore.rules`, `storage.rules`)
2. Run `./deploy-rules.sh` or deploy manually
3. Test the changes in your development environment
4. Monitor the Firebase Console for any errors