# Gaia - Fitness & Health Companion

A comprehensive 3D interactive fitness and health application built with React, Three.js, and modern web technologies.

## 🌟 Project Overview

Gaia is an innovative fitness companion that combines 3D visualization with personalized health monitoring and exercise recommendations. The application features interactive 3D avatars and provides a seamless user experience for health tracking and fitness guidance.

### Key Features

• **Interactive 3D Avatars**: High-quality 3D human body models with gender selection (male/female)
• **Body Part Navigation**: Clickable body parts that lead to targeted exercise routines
• **Real-time Health Monitoring**: Track vital signs including heart rate, blood pressure, temperature, and fatigue levels
• **Personalized Exercise Library**: Comprehensive collection of exercises organized by body parts (head, neck, shoulders, arms, wrists, back, legs)
• **Video-guided Workouts**: Embedded exercise videos with detailed English instructions
• **Smart Recommendations**: AI-powered health recommendations based on real-time data
• **Accessories Store**: Browse and purchase wellness accessories like massage pillows, scent diffusers, and air purifiers
• **Responsive Design**: Optimized for 1800x720px displays with smooth animations
• **Intuitive UI**: Modern gradient design with confirmation popups and smooth transitions

### Core Functionality

• **Main Dashboard**: Central hub with gender selection and navigation to different modules
• **Health Check Module**: 
  - Interactive 3D avatar with clickable body parts
  - Real-time health data simulation
  - Visual feedback with color-coded health status
  - Personalized exercise recommendations
• **Exercise & Stretching Module**:
  - Body part-specific exercise categories
  - Video tutorials with step-by-step instructions
  - Exercise history tracking
• **Accessories Module**:
  - Product catalog with detailed specifications
  - Interactive product browsing with navigation controls
  - Purchase and wishlist functionality

## 🚀 Technologies Used

- **Frontend Framework**: React 18
- **3D Graphics**: Three.js with React Three Fiber
- **3D Models**: GLTF/GLB format for human body avatars
- **Build Tool**: Vite
- **Styling**: CSS3 with modern gradients and animations
- **State Management**: React Hooks (useState, useEffect)
- **Camera Controls**: OrbitControls for 3D scene interaction

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aminssutt/Gaia.git
   cd finalversionAvatar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🎮 Usage

### Getting Started
1. Launch the application and select your avatar gender (Homme/Femme)
2. Choose from three main modules:
   - **Exercises & Stretching**: Browse exercise categories
   - **Health Check**: Monitor your health with interactive 3D avatar
   - **Accessories**: Explore wellness products

### Health Check Module
1. View your real-time health metrics on the side panels
2. Click on body parts of the 3D avatar to explore targeted exercises
3. Confirm your selection in the popup dialog
4. Follow video-guided exercise routines

### Exercise Module
1. Browse exercise categories by clicking on body part cards
2. Access detailed exercise pages with video demonstrations
3. Follow English instructions for proper form and technique

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── AvatarViewer.jsx     # 3D avatar rendering and interaction
│   ├── InteractivePoint.jsx # Clickable body part points
│   ├── ConfirmationPopup.jsx # Exercise confirmation dialog
│   ├── HealthData.jsx       # Health metrics display
│   ├── VideoPlayer.jsx      # Exercise video component
│   └── ...
├── pages/               # Main application pages
│   ├── MainPage.jsx         # Landing page with navigation
│   ├── HealthCheck.jsx      # Health monitoring interface
│   ├── Exercises.jsx        # Exercise category selection
│   ├── ExerciseDetail.jsx   # Individual exercise details
│   └── Accessories.jsx      # Product catalog
├── utils/               # Utility functions
├── App.jsx              # Main application component
└── main.jsx            # Application entry point

public/
└── avatars/            # 3D model assets
    ├── man_muscle_human_body.glb
    ├── female_muscle_human_body.glb
    └── male_body.glb
```

## 🎨 Design Features

- **Modern UI**: Gradient backgrounds with glass-morphism effects
- **Smooth Animations**: Fade-in transitions and hover effects
- **Interactive Elements**: Responsive buttons with visual feedback
- **3D Integration**: Seamless blend of 2D UI and 3D content
- **Color Coding**: Health status indicators with intuitive color schemes

## 🔧 Configuration

The application is optimized for:
- **Display Resolution**: 1800x720px
- **Browser Support**: Modern browsers with WebGL support
- **Performance**: Optimized 3D rendering with LOD techniques

## 📈 Future Enhancements

- Integration with wearable devices for real health data
- Expanded exercise library with more body parts
- Social features for workout sharing
- Progress tracking and analytics
- Multi-language support
- Mobile responsiveness

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Amins Sutt**
- GitHub: [@aminssutt](https://github.com/aminssutt)

## 🙏 Acknowledgments

- Three.js community for excellent 3D web development tools
- React Three Fiber for seamless React-Three.js integration
- Contributors to open-source 3D models and assets

---

**Made with ❤️ for better health and fitness**
