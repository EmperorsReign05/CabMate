# Contributing to CabMate

Thank you for your interest in contributing to CabMate! This guide will help you get started.

## 🔧 Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/CabMate.git
   cd CabMate
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Add your Supabase and Google Maps API credentials

5. **Start the development server**:
   ```bash
   npm run dev
   ```

## 📝 Code Style

- We use **ESLint** for code linting
- Run `npm run lint` before committing
- Follow React best practices and hooks guidelines
- Use Material-UI components consistently
- Write meaningful commit messages

## 🐛 Reporting Issues

Before creating an issue, please:
- Check if the issue already exists
- Provide clear steps to reproduce
- Include error messages and screenshots
- Specify your browser and OS

## 🚀 Submitting Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Write clean, readable code
   - Add comments for complex logic
   - Ensure responsive design
   - Test on different screen sizes

3. **Test your changes**:
   ```bash
   npm run lint
   npm run build
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add: your descriptive commit message"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

## 📋 Pull Request Guidelines

- Provide a clear description of changes
- Reference any related issues
- Include screenshots for UI changes
- Ensure code passes linting
- Test on mobile and desktop

## 💡 Feature Ideas

Some ideas for contributions:
- **Enhanced Search**: Add filters for departure time, cost range
- **User Ratings**: Rating system for drivers and passengers
- **Chat System**: In-app messaging between users
- **Route Optimization**: Integration with traffic data
- **Push Notifications**: Real-time updates for ride requests
- **Social Features**: User profiles with photos and verification
- **Payment Integration**: Secure payment processing
- **Multi-language Support**: Internationalization
- **Dark Mode**: Theme switching capability
- **Accessibility**: WCAG compliance improvements

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── assets/             # Static assets
└── supabaseClient.js   # Supabase configuration
```

## 🔧 Tech Stack Knowledge

Helpful to know:
- **React 19** with hooks
- **Material-UI** component library
- **React Router** for navigation
- **Supabase** for backend services
- **Google Maps API** for location services
- **Vite** for build tooling

## 📞 Getting Help

- Open an issue for questions
- Check existing issues and discussions
- Contact maintainers for major changes

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Happy coding! 🚗✨