# Kanounji 2025 - UI/UX Design Specifications
## Tunisia's First Real-Time Legal Intelligence Mobile App

---

## 🎨 Design System Overview

### Brand Identity
- **App Name:** Kanounji 2025 (كنونجي 2025)
- **Tagline:** "Tunisia's Revolutionary Real-Time Legal Intelligence Platform"
- **Brand Personality:** Professional, Trustworthy, Modern, Culturally Authentic, User-Friendly

### Color Palette
- **Primary Green:** #2E8B57 (Sea Green - representing justice and growth)
- **Secondary Colors:**
  - Light Green: #90EE90
  - Dark Green: #006400
  - Gold Accent: #FFD700 (Tunisian cultural reference)
  - Red Alert: #EF4444
  - Orange Warning: #F59E0B
  - Blue Info: #3B82F6

### Dark/Light Theme Support
- **Light Theme:**
  - Background: #F9FAFB
  - Card Background: #FFFFFF
  - Text Primary: #1F2937
  - Text Secondary: #6B7280
  
- **Dark Theme:**
  - Background: #111827
  - Card Background: #1F2937
  - Text Primary: #FFFFFF
  - Text Secondary: #9CA3AF

### Typography
- **Primary Font:** System fonts (iOS: SF Pro, Android: Roboto)
- **Arabic Support:** Full RTL (Right-to-Left) layout support
- **Font Sizes:**
  - Large Title: 36px (Bold)
  - Title: 24px (Bold)
  - Headline: 20px (Semibold)
  - Body: 16px (Regular)
  - Caption: 12px (Medium)

---

## 📱 App Structure & Navigation

### Bottom Tab Navigation (5 Tabs)
1. **Dashboard** (الرئيسية) - Analytics icon
2. **Chat** (المحادثة) - Chat bubbles icon
3. **Search** (البحث) - Search icon
4. **Updates** (التحديثات) - Notifications icon (with badge)
5. **Profile** (الملف الشخصي) - Person icon

### Navigation Design Specifications
- **Tab Bar Height:** 60px (iOS), 65px (Android)
- **Tab Bar Style:** 
  - Background: White (light) / #1F2937 (dark)
  - Border: 1px top border #E5E7EB (light) / #374151 (dark)
  - Shadow: Subtle elevation with 8px blur
- **Active Tab:** #2E8B57 color with filled icons
- **Inactive Tab:** #6B7280 (light) / #9CA3AF (dark) with outline icons
- **Tab Labels:** 11px, semibold, 2px margin top

---

## 🏠 Dashboard Page - Detailed UI/UX Specifications

### Header Section
- **Background:** Gradient from #2E8B57 to #006400
- **Height:** 120px including safe area
- **Content:**
  - App logo (scale icon) - 32px
  - Title: "لوحة المعلومات القانونية" (18px, bold, white)
  - User avatar (40px circle, top right)

### Welcome Card
- **Layout:** Full-width card with rounded corners (12px)
- **Background:** White (light) / #1F2937 (dark)
- **Padding:** 20px
- **Shadow:** 0px 2px 4px rgba(0,0,0,0.1)
- **Content:**
  - Welcome text: "مرحباً بك في كنونجي 2025" (24px, bold, #2E8B57)
  - Subtitle: "منصة الذكاء القانوني التونسي" (16px, medium)
  - 3D Mascot placeholder (80px x 80px, centered)

### Quick Stats Section
- **Layout:** 3 equal-width cards in horizontal row
- **Card Specifications:**
  - Width: (Screen width - 48px) / 3
  - Height: 80px
  - Border radius: 12px
  - Background: White (light) / #1F2937 (dark)
  - Shadow: 0px 2px 4px rgba(0,0,0,0.1)
  - Margin: 4px between cards
- **Content per card:**
  - Large number: 28px, bold, #2E8B57
  - Label: 12px, medium, secondary text color
  - Examples: "24 تحديثات جديدة", "12 قوانين متابعة", "5 تنبيهات عاجلة"

### Recent Activity Section
- **Section Title:** "النشاط الأخير" (18px, bold, right-aligned)
- **Activity Cards:**
  - Full-width cards with 8px margin bottom
  - Background: White (light) / #1F2937 (dark)
  - Border radius: 12px
  - Padding: 16px
  - Left border: 4px solid #2E8B57
- **Card Content:**
  - Title: 16px, semibold, right-aligned
  - Time: 12px, secondary color, right-aligned
  - Icon: 20px, #2E8B57, left side

### Government Pulse Section
- **Section Title:** "نبض الحكومة" (18px, bold, right-aligned)
- **Pulse Cards:**
  - Similar to activity cards but with gold accent (#FFD700)
  - Ministry name: 16px, bold, #2E8B57
  - Content: 14px, regular, justified text
  - Timestamp: 12px, secondary color

---

## 💬 Chat Page - Detailed UI/UX Specifications

### Header
- **Background:** #2E8B57
- **Title:** "المساعد القانوني" (18px, bold, white, centered)
- **Height:** 56px + safe area

### Chat Interface
- **Background:** #F9FAFB (light) / #111827 (dark)
- **Message Bubbles:**
  
  **AI Messages (Left-aligned):**
  - Background: White (light) / #1F2937 (dark)
  - Border radius: 18px with 4px bottom-left corner
  - Max width: 80% of screen
  - Padding: 12px
  - Shadow: 0px 1px 2px rgba(0,0,0,0.1)
  - Text: 16px, right-aligned Arabic
  
  **User Messages (Right-aligned):**
  - Background: #2E8B57
  - Border radius: 18px with 4px bottom-right corner
  - Max width: 80% of screen
  - Padding: 12px
  - Text: 16px, white, right-aligned

### 3D Mascot Integration
- **Position:** Top-left of AI messages
- **Size:** 40px x 40px
- **Animation:** Subtle breathing/blinking animation
- **Sector-specific:** Changes based on legal topic

### Quick Questions (Initial State)
- **Layout:** Horizontal scrollable chips
- **Chip Design:**
  - Background: White (light) / #1F2937 (dark)
  - Border: 1px solid #2E8B57
  - Border radius: 20px
  - Padding: 8px 16px
  - Text: 14px, #2E8B57, medium weight
- **Questions:**
  - "ما هي قوانين العمل الجديدة؟"
  - "كيف أسجل شركة في تونس؟"
  - "ما هي حقوقي كموظف؟"
  - "قوانين الضرائب الحالية"

### Input Area
- **Background:** White (light) / #1F2937 (dark)
- **Border:** 1px top border
- **Padding:** 16px
- **Layout:** Horizontal flex
- **Text Input:**
  - Flex: 1
  - Background: #F3F4F6 (light) / #374151 (dark)
  - Border radius: 20px
  - Padding: 12px 16px
  - Placeholder: "اكتب سؤالك القانوني هنا..."
  - Max height: 100px (multiline)
- **Send Button:**
  - Size: 44px x 44px
  - Background: #2E8B57
  - Border radius: 22px
  - Icon: Send arrow, 20px, white
  - Margin left: 12px

### Voice Input Integration
- **Voice Button:** Microphone icon in input area
- **Recording State:** Pulsing red animation
- **Tunisian Dialect Support:** Visual indicator for dialect recognition

---

## 🔍 Search Page - Detailed UI/UX Specifications

### Header with Search
- **Background:** White (light) / #1F2937 (dark)
- **Search Input:**
  - Full width with 16px margins
  - Height: 48px
  - Background: #F3F4F6 (light) / #374151 (dark)
  - Border radius: 12px
  - Padding: 12px 16px
  - Placeholder: "ابحث في آلاف القوانين والأنظمة التونسية"
  - Search icon: 20px, right side
  - Text: Right-aligned Arabic

### Filter Chips
- **Layout:** Horizontal scrollable row
- **Chip Design:**
  - Height: 36px
  - Border radius: 20px
  - Padding: 8px 16px
  - Margin right: 8px
- **States:**
  - Active: Background #2E8B57, text white
  - Inactive: Background #F3F4F6 (light) / #374151 (dark), text primary
- **Filters:** "الكل", "قوانين", "لوائح", "قرارات", "منشورات حكومية"

### Search Results
- **Result Cards:**
  - Full-width cards
  - Background: White (light) / #1F2937 (dark)
  - Border radius: 12px
  - Margin bottom: 12px
  - Padding: 16px
  - Shadow: 0px 2px 4px rgba(0,0,0,0.1)

- **Card Header:**
  - Title: 18px, bold, #2E8B57, right-aligned
  - Relevance badge: Circular, 24px, background #2E8B57, white text

- **Card Content:**
  - Description: 14px, secondary color, right-aligned, 3 lines max
  - Source: 12px, #2E8B57, semibold
  - Date: 12px, secondary color

### Empty States
- **No Results:**
  - Icon: Search outline, 64px, secondary color
  - Title: "لم يتم العثور على نتائج"
  - Subtitle: "جرب استخدام كلمات مفتاحية مختلفة"

- **Initial State:**
  - Icon: Document outline, 64px, secondary color
  - Title: "ابحث في آلاف القوانين والأنظمة التونسية"
  - Subtitle: "استخدم البحث الذكي للعثور على المعلومات القانونية"

---

## 🔔 Updates Page - Detailed UI/UX Specifications

### Header Stats
- **Background:** White (light) / #1F2937 (dark)
- **Layout:** Two equal columns
- **Stats Cards:**
  - Text alignment: Center
  - Large number: 24px, bold, #2E8B57
  - Label: 12px, secondary color
- **Border:** 1px bottom border

### Category Filters
- **Layout:** Horizontal scrollable chips
- **Background:** White (light) / #1F2937 (dark)
- **Chip Design:** Same as search filters
- **Categories:** "الكل", "استثمار", "عمل", "ضرائب", "تجارة"

### Update Cards
- **Card Design:**
  - Background: White (light) / #1F2937 (dark)
  - Border radius: 12px
  - Margin bottom: 12px
  - Padding: 16px
  - Shadow: 0px 2px 4px rgba(0,0,0,0.1)

- **Unread Indicator:**
  - Left border: 4px solid #2E8B57
  - Unread dot: 8px circle, #2E8B57, next to title

- **Priority Badges:**
  - High (عاجل): Background #EF4444, white text
  - Medium (متوسط): Background #F59E0B, white text
  - Low (عادي): Background #10B981, white text
  - Size: 12px text, 4px 8px padding, 12px border radius

- **Card Content:**
  - Title: 16px, semibold, right-aligned
  - Content: 14px, secondary color, right-aligned, 3 lines max
  - Footer: Flex row with source and time
  - Source: 12px, #2E8B57, semibold
  - Time: 12px, secondary color

### Pull-to-Refresh
- **Indicator:** Circular progress, #2E8B57
- **Animation:** Smooth pull gesture with haptic feedback

---

## 👤 Profile Page - Detailed UI/UX Specifications

### Profile Header
- **Background:** White (light) / #1F2937 (dark)
- **Layout:** Horizontal flex
- **Avatar:**
  - Size: 80px x 80px
  - Border radius: 40px
  - Background: #2E8B57
  - Icon: Person, 40px, white
  - Margin right: 16px

- **User Info:**
  - Name: 20px, bold, right-aligned
  - Email: 14px, secondary color, right-aligned
  - Sector: 14px, #2E8B57, medium weight, right-aligned

### Stats Section
- **Layout:** 3 equal-width cards
- **Card Design:**
  - Background: White (light) / #1F2937 (dark)
  - Border radius: 12px
  - Padding: 16px
  - Text alignment: Center
  - Shadow: 0px 2px 4px rgba(0,0,0,0.1)

- **Content:**
  - Number: 24px, bold, #2E8B57
  - Label: 12px, secondary color, center-aligned

### Achievements Section
- **Section Title:** "الإنجازات الأخيرة" (18px, bold, right-aligned)
- **Layout:** Horizontal scrollable cards
- **Achievement Cards:**
  - Width: 140px
  - Background: White (light) / #1F2937 (dark)
  - Border radius: 12px
  - Padding: 16px
  - Margin right: 12px
  - Text alignment: Center

- **Card Content:**
  - Icon background: 48px circle, #F3F4F6 (light) / #374151 (dark)
  - Icon: 24px, #2E8B57
  - Title: 14px, bold, center-aligned
  - Description: 12px, secondary color, center-aligned

### Settings Section
- **Section Title:** "الإعدادات" (18px, bold, right-aligned)
- **Setting Items:**
  - Background: White (light) / #1F2937 (dark)
  - Border radius: 12px
  - Padding: 16px
  - Margin bottom: 8px
  - Layout: Horizontal flex with space between

- **Item Content:**
  - Icon: 20px, #2E8B57, in 40px circle background
  - Text: Flex column, right-aligned
  - Title: 16px, semibold
  - Subtitle: 12px, secondary color
  - Toggle: iOS/Android native switch, #2E8B57 active color

### Menu Section
- **Menu Items:**
  - Similar to settings but with chevron-back icon
  - Tap state: Slight opacity change
  - Logout item: Red text color (#EF4444)

### Version Footer
- **Text:** "كنونجي 2025 - الإصدار 1.0.0"
- **Style:** 12px, secondary color, center-aligned
- **Padding:** 20px vertical

---

## 🎭 3D Mascot System Specifications

### Mascot Design Requirements
- **Cultural Authenticity:** Traditional Tunisian clothing and accessories
- **Sector Representation:**
  - Money/Finance: Traditional merchant attire with gold accents
  - Food/Agriculture: Farmer clothing with olive branch elements
  - Business: Modern professional attire with Tunisian flag pin
  - Tourism: Traditional Tunisian dress with cultural symbols
  - Education: Academic robes with Tunisian university elements

### Animation Specifications
- **Idle State:** Subtle breathing and blinking (2-second loop)
- **Speaking State:** Mouth movement synchronized with voice
- **Celebration:** Jumping and clapping for achievements
- **Thinking:** Hand on chin with question marks
- **Greeting:** Waving hand with smile

### Technical Requirements
- **3D Engine:** React Native Skia integration
- **File Format:** GLTF/GLB for 3D models
- **Animation:** Skeletal animation with smooth transitions
- **Performance:** 60fps on mid-range devices
- **Size Optimization:** Models under 2MB each

---

## 🌐 Responsive Design Specifications

### Screen Size Breakpoints
- **Phone:** < 768px width
- **Tablet:** 768px - 1024px width
- **Desktop Web:** > 1024px width

### Responsive Adaptations
- **Phone:** Single column layout, full-width cards
- **Tablet:** Two-column layout where appropriate, larger text
- **Desktop:** Three-column layout, sidebar navigation

### Orientation Support
- **Portrait:** Default layout optimized for one-handed use
- **Landscape:** Adjusted spacing and layout for wider screens

---

## ♿ Accessibility Specifications

### Text Accessibility
- **Minimum Text Size:** 12px (with user scaling support)
- **Contrast Ratios:** WCAG AA compliant (4.5:1 minimum)
- **Font Scaling:** Support for system font size preferences

### Touch Accessibility
- **Minimum Touch Target:** 44px x 44px
- **Touch Feedback:** Visual and haptic feedback for all interactions
- **Voice Control:** Full VoiceOver/TalkBack support

### Visual Accessibility
- **Color Blindness:** Information not conveyed by color alone
- **High Contrast:** Enhanced contrast mode support
- **Reduced Motion:** Respect system motion preferences

---

## 🎨 Animation & Interaction Specifications

### Micro-Interactions
- **Button Press:** Scale down to 0.95 with haptic feedback
- **Card Tap:** Subtle elevation increase
- **Loading States:** Skeleton screens with shimmer effect
- **Pull-to-Refresh:** Elastic scroll with progress indicator

### Page Transitions
- **Tab Switch:** Fade transition (200ms)
- **Modal Present:** Slide up from bottom (300ms)
- **Navigation:** Slide from right (300ms)

### Loading States
- **Skeleton Screens:** Gray placeholders matching content layout
- **Shimmer Effect:** Subtle animated gradient overlay
- **Progress Indicators:** Circular progress with #2E8B57 color

---

## 📐 Layout Grid System

### Spacing Scale
- **4px:** Micro spacing (icon padding)
- **8px:** Small spacing (between related elements)
- **12px:** Medium spacing (card margins)
- **16px:** Large spacing (section padding)
- **20px:** Extra large spacing (page margins)
- **24px:** Section spacing
- **32px:** Page spacing

### Component Sizing
- **Icons:** 16px, 20px, 24px, 32px, 40px
- **Buttons:** 44px height minimum
- **Cards:** 12px border radius
- **Input Fields:** 48px height
- **Tab Bar:** 60px height

---

## 🔧 Technical Implementation Notes

### Performance Optimization
- **Image Optimization:** WebP format with fallbacks
- **Lazy Loading:** Images and heavy components
- **Memory Management:** Efficient 3D model loading/unloading
- **Battery Optimization:** Reduced animations on low battery

### Platform-Specific Considerations
- **iOS:** Native navigation feel, SF Pro font, iOS-style switches
- **Android:** Material Design elements, Roboto font, Android switches
- **Web:** Responsive breakpoints, keyboard navigation support

### RTL (Right-to-Left) Support
- **Text Direction:** Automatic RTL for Arabic content
- **Layout Mirroring:** Icons and navigation elements flip appropriately
- **Mixed Content:** Proper handling of Arabic/English mixed text

---

This comprehensive UI/UX specification document provides all the necessary details for an AI to generate accurate and culturally appropriate designs for your Kanounji 2025 mobile app, incorporating both modern design principles and authentic Tunisian cultural elements.