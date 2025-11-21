**UniVerse: AI Driven Campus Event Manager**

UniVerse is a simple, modern web application for campus event management, designed for both event organizers and participants. Organizers can effortlessly create and manage events, while participants can browse, register for, and attend them. The application features an interactive calendar for scheduling, detailed event views, and leverages the Google Gemini AI for intelligent event proposal generation.

---

**Features**

**For Organizers**

* Event Creation: Intuitive form to create new events with details like name, date, time, location, capacity, and organizer.
* AI-Powered Proposal Generation: Integrate with Google Gemini AI to generate detailed and engaging event descriptions based on initial inputs, streamlining the planning process.
* Calendar View: A clear, interactive calendar displays all scheduled events, helping organizers visualize their schedule.
* Event Management: View and potentially update event details (though current implementation focuses on creation and registration).
* Clash Detection: Automatically prevents event overlaps, ensuring no two events are scheduled at the same time and place.

**For Participants**

* Event Browsing: Easily discover available events through a user-friendly calendar interface.
* Event Details: View comprehensive information for each event, including rich descriptions rendered with Markdown.
* Event Registration: Register for events with a single click, with automatic capacity checks.
* Interactive Calendar: Visually see events on specific dates, with current day highlights.

**General**

* Responsive Design: Built with Tailwind CSS, ensuring a consistent and appealing experience across various devices.
* Client-Side Persistence: Events are stored in `localStorage`, allowing data to persist across browser sessions.
* Accessibility (A11y): Developed with ARIA attributes and semantic HTML to ensure usability for all users.
* Modular Architecture: Organized into reusable React components and services for maintainability and scalability.

---

**Technologies Used**

* React: A JavaScript library for building user interfaces.
* TypeScript: A typed superset of JavaScript that compiles to plain JavaScript.
* Tailwind CSS: A utility-first CSS framework for rapidly building custom designs.
* Google Gemini API (`@google/genai`): For AI-powered event proposal generation.
* `react-markdown`: For rendering Markdown content in event descriptions.
* `localStorage`: For client-side data persistence.

---

**Project Structure**

```
.
├── index.html
├── index.tsx
├── metadata.json
├── App.tsx
├── constants.ts
├── types.ts
├── components/
│   ├── Button.tsx
│   ├── Calendar.tsx
│   ├── EventCard.tsx
│   ├── EventDetails.tsx
│   ├── EventForm.tsx
│   ├── Input.tsx
│   ├── LoadingSpinner.tsx
│   ├── Modal.tsx
│   ├── OrganizerDashboard.tsx
│   └── ParticipantDashboard.tsx
└── services/
    ├── apiService.ts
    └── geminiService.ts
```

---

**Setup and Installation**

**Prerequisites**

* A web browser (Chrome, Firefox, Edge, etc.)
* Optional for AI features: A Google Cloud Project with the Gemini API enabled and an associated API key. This project must be linked to a billing account for `gemini-3-pro-preview` model usage.

**Running the Application**

This application is designed to run directly in a browser environment, particularly within the Google AI Studio Codelab environment where `@google/genai` and React are provided via CDN.

1. Clone the repository (if applicable):

   ```
   git clone [your-repo-url]
   cd UniVerse
   ```

2. Open `index.html`:

   In a local development setup, you would typically open `index.html` in your browser. However, for a fully functional React/TypeScript setup, you'd usually need a build step (e.g., Vite or Create React App) to compile the TypeScript and bundle the modules.

   **For AI Studio / Codelab Environment:**
   The platform will handle serving `index.html` and resolving the `importmap` for `@google/genai`, `react`, and `react-dom`.

**Configuring the Gemini API Key (for Organizers)**

To use the AI-powered event proposal generation feature in the Organizer Dashboard, you need to provide a Google Gemini API key.

1. **AI Studio Environment:**
   If running in an AI Studio Codelab, the application will automatically prompt you to “Select API Key” if one isn't configured. Click this button and choose an API key from a paid GCP project. This key is injected as `process.env.API_KEY`.

2. **Local Development:**
   Set an environment variable in a `.env` file:

   ```
   REACT_APP_API_KEY=YOUR_GEMINI_API_KEY
   ```

   Access it in your code via `process.env.REACT_APP_API_KEY`.

---

**How to Use**

**As an Organizer**

1. Switch to the Organizer view.
2. If prompted, click “Select API Key.”
3. Create a new event.
4. Fill in event details.
5. Optionally generate a proposal using AI.
6. Review and adjust.
7. Click “Create Event.”

**As a Participant**

1. Switch to the Participant view.
2. Browse the calendar.
3. Click a day with events.
4. View event details.
5. Register with a single click.

---
