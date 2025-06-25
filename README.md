# Calendar App (Frontend)

This is a simple and modern calendar web application built using React, Vite, and Tailwind CSS.  
It allows users to manage events in a monthly calendar view directly in the browser.

## How the Project Works

- **Monthly Calendar View:**  
  The main interface displays a calendar for the current month. Each day shows its scheduled events.

- **Event Creation:**  
  Click the "Create Event" button or double-click any day in the calendar to add a new event.  
  You can specify the event's title, date, start and end time, and choose a color for easy identification.

- **Event Editing & Deletion:**  
  Click on any event to view its details. You can edit or delete the event from the modal that appears.

- **Event List for a Day:**  
  If a day has multiple events, you can view all of them in a list and manage each one individually.

- **Conflict Detection:**  
  The app visually indicates if two events overlap in time on the same day.

- **Data Persistence:**  
  All events are stored in your browser's local storage. This means your events remain available even after refreshing or closing the browser tab.

- **Responsive Design:**  
  The calendar layout adapts to different screen sizes, making it usable on both desktop and mobile devices.

## Usage

- **No backend required:**  
  This is a frontend-only project. All data is managed in the browser.

- **Customization:**  
  You can change the initial events by editing `src/data/events.json`.  
  The UI can be restyled easily using Tailwind CSS utility classes.

---

This project is ideal for learning React, working with date/time in JavaScript, and building interactive UIs with modals and forms.
