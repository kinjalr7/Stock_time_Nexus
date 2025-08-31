# AI Chatbot with Advanced UI

A modern, feature-rich chatbot component built with React, TypeScript, and Framer Motion.

## 🚀 Features

### Core Functionality
- **Real-time Chat Interface**: Smooth, responsive chat experience
- **Typing Indicators**: Animated typing indicators while AI processes responses
- **Message Animations**: Beautiful entrance and exit animations for all messages
- **Auto-scroll**: Automatically scrolls to the latest message

### Advanced Information Display
- **Confidence Scoring**: Visual confidence bars showing AI response reliability
- **Processing Time**: Shows how long each response took to generate
- **Token Count**: Displays the number of tokens used in each response
- **Source Attribution**: Lists sources used to generate responses
- **Message Types**: Different styling for success, error, info, and regular messages

### UI/UX Features
- **Minimize/Expand**: Collapsible chat window with floating button
- **Responsive Design**: Works perfectly on desktop and mobile
- **Modern Design**: Gradient backgrounds, rounded corners, and smooth shadows
- **Keyboard Shortcuts**: Press Enter to send messages
- **Toast Notifications**: Success/error notifications for high-confidence responses

### Technical Features
- **TypeScript**: Fully typed for better development experience
- **Framer Motion**: Smooth animations and transitions
- **Tailwind CSS**: Modern styling with utility classes
- **React Hooks**: Uses modern React patterns
- **Error Handling**: Graceful error handling with user feedback

## 🎨 Design Highlights

### Color Scheme
- **Primary**: Purple to Blue gradient (`from-purple-600 to-blue-600`)
- **User Messages**: Blue background (`bg-blue-500`)
- **Bot Messages**: White background with colored borders based on type
- **Success**: Green accents
- **Error**: Red accents
- **Info**: Blue accents

### Animations
- **Message Entrance**: Scale and fade-in effects
- **Typing Indicator**: Pulsing dots with staggered timing
- **Button Hover**: Scale effects on interactive elements
- **Confidence Bars**: Animated progress bars
- **Window Transitions**: Smooth minimize/expand animations

## 📱 Usage

### Basic Implementation
```tsx
import Chatbot from './components/Chatbot';

function App() {
  return (
    <div>
      <h1>My App</h1>
      <Chatbot />
    </div>
  );
}
```

### With Custom Styling
```tsx
<Chatbot className="custom-chatbot-styles" />
```

## 🔧 Customization

### Message Types
The chatbot supports different message types with automatic styling:
- `text`: Regular messages
- `info`: Informational messages (blue styling)
- `success`: Success messages (green styling)
- `error`: Error messages (red styling)

### Metadata Display
Each bot message can include metadata:
```typescript
interface MessageMetadata {
  confidence?: number;        // 0-1 confidence score
  sources?: string[];         // Array of source names
  processingTime?: number;    // Processing time in seconds
  tokens?: number;           // Number of tokens used
}
```

## 🎯 Demo Page

Visit `/chatbot` to see the full demo page with:
- Feature showcase
- Performance metrics
- How-it-works section
- Interactive chatbot

## 🛠️ Dependencies

- **React**: ^18.3.1
- **TypeScript**: ^5.5.3
- **Framer Motion**: ^11.0.0
- **Lucide React**: ^0.344.0
- **React Hot Toast**: ^2.4.1
- **Tailwind CSS**: ^3.4.1

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Navigate to `/chatbot` to see the demo

## 📊 Performance

The chatbot is optimized for:
- **Fast Rendering**: Efficient React patterns
- **Smooth Animations**: 60fps animations with Framer Motion
- **Memory Management**: Proper cleanup and ref management
- **Accessibility**: Keyboard navigation and screen reader support

## 🎨 Customization Examples

### Custom Theme
```tsx
// Override Tailwind classes for custom theming
<Chatbot className="[&_.bg-purple-600]:bg-red-600 [&_.bg-blue-600]:bg-orange-600" />
```

### Custom Message Styling
```tsx
// Add custom CSS for message styling
.chatbot-message {
  @apply custom-shadow custom-border;
}
```

## 🔮 Future Enhancements

Potential features to add:
- Voice input/output
- File upload support
- Rich media messages (images, videos)
- Conversation history persistence
- Multi-language support
- Custom AI model integration
- Analytics dashboard
- User preferences panel

## 📝 License

This chatbot component is part of the Stock Time Nexus project and follows the same licensing terms.
