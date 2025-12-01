# FlowSync - Real-Time Collaborative Kanban Board

A production-ready, collaborative Kanban board with AI-powered task management using React, Firestore, and the Perplexity API.

![FlowSync Banner](https://img.shields.io/badge/FlowSync-Real--Time%20Kanban-0ea5e9?style=for-the-badge)

## ✨ Features

### 🚀 Core Functionality
- **Real-Time Sync**: All changes sync instantly across all connected users using Firestore
- **Drag & Drop**: Smooth card movement with automatic re-indexing and data integrity
- **Collaborative**: Multiple users can work on the same board simultaneously
- **Responsive Design**: Works beautifully on desktop and mobile devices

### 📋 List Management (STEP 1)
- ✅ **Add New Lists**: Create custom workflow columns
- ✅ **Delete Lists**: Remove lists with automatic card cleanup
- ✅ **Edit List Title**: Click to edit list names inline
- ✅ **WIP Limits**: Set and edit Work-In-Progress limits with visual violation indicators

### 👥 Collaboration Features (STEP 2)
- ✅ **User Profiles**: Mock user system with avatars and colors
- ✅ **Assignee Dropdown**: Easily assign tasks to team members
- ✅ **Display Names**: Friendly names instead of user IDs throughout the UI

### 🤖 AI-Powered Features
- ✅ **Task Refinement**: AI expands brief titles into detailed action plans
- ✅ **Auto-Estimate Complexity**: AI analyzes tasks and assigns Low/Medium/High priority
- ✅ **Board Summary (STEP 3)**: Executive-level analysis identifying bottlenecks and risks

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS (custom design system)
- **Database**: Firebase Firestore (real-time sync)
- **Drag & Drop**: @dnd-kit (modern DnD library)
- **AI**: Perplexity API (llama-3.1-sonar-small-128k-online)
- **Icons**: React Icons

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Firebase project ([Create one here](https://console.firebase.google.com/))
- Perplexity API key ([Get one here](https://www.perplexity.ai/))

### Setup Steps

1. **Clone and Install**
   ```bash
   cd FlowSync
   npm install
   ```

2. **Configure Environment Variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

   # Perplexity API
   VITE_PERPLEXITY_API_KEY=pplx-your-api-key-here
   ```

3. **Set Up Firestore**
   
   In your Firebase Console:
   - Go to Firestore Database
   - Create a database (start in test mode for development)
   - The app will auto-initialize the board structure on first run

4. **Run Development Server**
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:3000`

5. **Build for Production**
   ```bash
   npm run build
   npm run preview
   ```

## 🎯 Usage Guide

### Managing Lists
- **Add List**: Click "Add New List" in the header
- **Edit Title**: Click on any list title to edit
- **Set WIP Limit**: Click the WIP badge to set/edit the limit
- **Delete List**: Click the trash icon (⚠️ permanently deletes all cards)

### Managing Cards
- **Add Card**: Click "+ Add Card" in any list
- **Move Card**: Drag and drop cards between lists
- **Edit Card**: Click on a card to open the detail modal
- **Delete Card**: Open card modal and click "Delete Card"

### AI Features
1. **Refine Task**: 
   - Open a card
   - Enter a brief title
   - Click "✨ AI: Refine Task into Action Plan"
   - AI generates detailed steps

2. **Auto-Estimate**:
   - Add task description
   - Click "Auto-Estimate"
   - AI sets Low/Medium/High priority

3. **Analyze Flow**:
   - Click "Analyze Flow" in header
   - AI provides executive summary with insights

### Assigning Tasks
- Open any card
- Select a user from the "Assignee" dropdown
- The assignee's avatar appears on the card

## 📊 Data Structure

### Firestore Collections

**`boards` collection** (document: `main-board`):
```javascript
{
  lists: [
    {
      id: "list-1",
      title: "To Do",
      wipLimit: 5,
      index: 0
    }
  ]
}
```

**`cards` collection**:
```javascript
{
  id: "card-xyz",
  title: "Task title",
  description: "Detailed description",
  listId: "list-1",
  index: 0,
  assigneeId: "user-1",
  priority: "Medium",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

## 🎨 Design Philosophy

FlowSync uses a **premium dark theme** with:
- **Glassmorphism**: Frosted glass effects for depth
- **Smooth Animations**: Micro-interactions for delight
- **Vibrant Accents**: Blue primary color with status-based highlights
- **Inter Font**: Modern, professional typography
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🔒 Security Notes

For production deployment:
1. **Firestore Rules**: Update security rules (currently in test mode)
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

2. **Environment Variables**: Never commit `.env` to version control
3. **API Keys**: Use environment-specific keys
4. **Authentication**: Implement proper user authentication

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify all environment variables are correct
- Check Firebase project permissions
- Ensure Firestore is enabled in Firebase Console

### AI Features Not Working
- Verify Perplexity API key is valid
- Check browser console for API errors
- Ensure you have API credits remaining

### Drag and Drop Issues
- Clear browser cache
- Check for browser compatibility (@dnd-kit requires modern browsers)

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 🌟 Acknowledgments

Built with modern best practices for:
- Real-time collaborative applications
- AI-assisted productivity tools
- Production-ready React development

---

**Built with ❤️ using React, Firestore, and AI**
