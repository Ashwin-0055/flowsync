# 🎉 FlowSync is Almost Ready!

## ✅ Firebase Configuration - DONE!
Your Firebase credentials have been added to the project.

## ⚠️ Next Step: Add Your Perplexity API Key

To use the AI features, you need to add your Perplexity API key.

### How to Get a Perplexity API Key:

1. Go to [https://www.perplexity.ai/](https://www.perplexity.ai/)
2. Sign up or log in
3. Go to **Settings** → **API**
4. Click **Generate API Key**
5. Copy the key (starts with `pplx-`)

### Create `.env.local` File:

Create a file named `.env.local` in the FlowSync folder (same folder as package.json) with:

```env
VITE_PERPLEXITY_API_KEY=pplx-your-api-key-here
```

Replace `pplx-your-api-key-here` with your actual key.

---

## 🚀 Run the App

After adding your API key:

```bash
npm run dev
```

The app will open at **http://localhost:3000**

---

## ✨ Features You Can Test:

### Without API Key (Works):
- ✅ Create, edit, delete cards
- ✅ Drag and drop cards between lists
- ✅ Add, edit, delete lists
- ✅ Set WIP limits
- ✅ Assign users to cards
- ✅ Real-time collaboration (open in 2 windows!)

### With API Key (AI Features):
- 🤖 AI Task Refinement
- 🤖 Auto-Complexity Estimation
- 🤖 Board Flow Analysis

---

## 📝 Quick Commands:

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

**You're all set!** Just add your Perplexity API key and start building! 🎊
