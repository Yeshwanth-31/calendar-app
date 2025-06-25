# Calendar App (Frontend)

This project is a modern **React** + **Vite** frontend calendar application. It allows users to view, create, edit, and delete events in a monthly calendar interface. The app is styled with **Tailwind CSS** and uses browser local storage for data persistence.

## Features

- **Monthly Calendar View:** Visualize all days of the month, with events displayed on their respective dates.
- **Event Management:** Add, edit, and delete events with title, date, time, and color.
- **Event Details:** Click on an event to view or edit its details in a modal dialog.
- **Conflict Detection:** Overlapping events are visually indicated.
- **Responsive Design:** Works well on both desktop and mobile devices.
- **Persistent Storage:** Events are saved in the browser's local storage.
- **Modern UI:** Built with Tailwind CSS for a clean and modern look.

## Tech Stack

- **React 19** (functional components and hooks)
- **Vite** (for fast development and build)
- **Tailwind CSS** (utility-first styling)
- **Day.js** (date handling)
- **React Icons** (UI icons)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview the production build:**
   ```bash
   npm run preview
   ```

## Project Structure

- `src/App.jsx` - Main application logic and state management.
- `src/components/Calendar.jsx` - Calendar grid and event rendering.
- `src/components/EventModal.jsx` - Modal for viewing/creating/editing events.
- `src/data/events.json` - Initial event data (used if local storage is empty).
- `src/index.css` - Tailwind CSS imports.

## Deployment

This is a frontend-only project and can be deployed to any static hosting service (e.g., Vercel, Netlify, GitHub Pages).  
No backend is required; all data is stored in the browser.

## Customization

- You can change the initial events in `src/data/events.json`.
- Tailwind colors and styles can be easily adjusted in the components.

## License

This project is open source and free to use for learning or as a starter for your own calendar app.

## How to Commit and Push to GitHub

1. **Initialize git (if not already initialized):**
   ```bash
   git init
   ```

2. **Add all files to staging:**
   ```bash
   git add .
   ```

3. **Commit your changes:**
   ```bash
   git commit -m "Initial commit: Calendar App frontend"
   ```

4. **Create a new repository on GitHub**  
   Go to [github.com](https://github.com/) and create a new repository (do not initialize with README).

5. **Add the remote origin (replace `<your-username>` and `<repo-name>`):**
   ```bash
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   ```

6. **Push your code to GitHub:**
   ```bash
   git branch -M main
   git push -u origin main
   ```

Now your project will be available on GitHub.

## How to Update and Push Changes to GitHub

1. **Check status of your files:**
   ```bash
   git status
   ```

2. **Add updated files to staging:**
   ```bash
   git add .
   ```

3. **Commit your changes with a message:**
   ```bash
   git commit -m "Update README and project details"
   ```

4. **Push your changes to GitHub:**
   ```bash
   git push
   ```

Your changes will now be updated on your GitHub repository.
