# 📋 Cross-Platform Task Management App – Project Plan

## 1. Objective
Build a cross-platform (iOS + Android) task management app with:
- Authentication  
- Offline-first storage with sync  
- Push notifications  
- Modular, maintainable architecture  

---

## 2. Features

### 🔐 Authentication
- Sign Up & Login with **Firebase Authentication (email/password)**  
- Persist user session using Firebase SDK  
- Logout functionality  

### ✅ Task Management
- Add, edit, delete tasks  
- Mark tasks as complete/incomplete  
- Local persistence of tasks  
- Sync with **Firestore** when online  

### 📶 Offline Support
- Use **Realm** or **SQLite** for local DB  
- Store tasks locally when offline  
- Auto-sync with Firestore when connection is restored  

### 🔔 Push Notifications
- **Local notifications** for task reminders (using `react-native-push-notification` or Expo Notifications)  
- (Bonus) **Server push notifications** via Firebase Cloud Messaging (FCM)  

### ⚙️ Multi-Environment Config
- Separate configs for **development, staging, production**  
- Store Firebase keys & API URLs per environment  

### 🎨 Theming
- Dark / Light mode support  
- Store theme preference in Redux / AsyncStorage  

### 🗂️ State Management
- **Redux Toolkit** for predictable state management  
- Slices: `auth`, `tasks`, `settings`, `notifications`  

### 🧭 Navigation
- **React Navigation** setup with modular stacks  
  - **Auth Stack** (Login, Sign Up)  
  - **App Stack** (Tasks, Settings, Profile)  
  - **Root Navigator** for conditional routing (auth vs app)  

---

## 3. Tech Stack
- **Frontend:** React Native (Expo or CLI)  
- **Auth & Backend:** Firebase Authentication, Firestore  
- **Local DB:** Realm / SQLite  
- **Push Notifications:** Firebase Cloud Messaging, Local Notifications  
- **State Management:** Redux Toolkit  
- **Navigation:** React Navigation v6  
- **Theming:** React Native Paper / Styled Components  

---

## 4. Project Structure
```
/src
  /api
    authService.ts
    taskService.ts
  /components
    TaskItem.tsx
    Button.tsx
  /navigation
    AuthStack.tsx
    AppStack.tsx
    RootNavigator.tsx
  /redux
    store.ts
    /slices
      authSlice.ts
      taskSlice.ts
      settingsSlice.ts
  /screens
    /Auth
      LoginScreen.tsx
      SignupScreen.tsx
    /Tasks
      TaskListScreen.tsx
      TaskDetailScreen.tsx
      AddTaskScreen.tsx
    /Settings
      SettingsScreen.tsx
  /utils
    theme.ts
    constants.ts
    env.ts
```

---

## 5. Development Plan (Milestones)

### **Phase 1: Setup & Authentication**
- Setup project (Expo/CLI)  
- Configure Firebase for dev/staging/prod  
- Implement Sign Up / Login / Logout  
- Persist sessions  

### **Phase 2: Task Management (Online)**
- Build CRUD operations for tasks with Firestore  
- Task List, Add Task, Edit Task UI  

### **Phase 3: Offline Support**
- Integrate Realm/SQLite  
- Store tasks locally when offline  
- Implement sync logic with Firestore  

### **Phase 4: Notifications**
- Local notifications for reminders  
- Setup FCM for server push (bonus)  

### **Phase 5: Theming & Settings**
- Add dark/light theme toggle  
- Store theme preference  

### **Phase 6: Final Polish**
- Navigation guards (Auth vs App)  
- Code cleanup & modularization  
- Testing and QA  

---

## 6. Bonus Enhancements (Future Scope)
- Task categories / labels  
- Task priority & sorting  
- Calendar view for tasks  
- Sharing tasks with other users  

---

✅ With this plan, the app will be **modular, offline-first, and scalable**.  
