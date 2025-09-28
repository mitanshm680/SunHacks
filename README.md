# SunHacks - AI-Powered Student Scheduler

A Next.js application that integrates with Google Calendar and Canvas to provide intelligent scheduling for students.

## Prerequisites

- Node.js 18 or higher
- npm or pnpm

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd SunHacks
npm install
# OR
pnpm install
```

### 2. Run the Application

```bash
npm run dev
# OR
pnpm dev
```

The application will be available at `http://localhost:3000`

## Features

- **Google Calendar Integration**: Connect and sync with your Google Calendar
- **Canvas Integration**: Import assignments from Canvas LMS
- **AI-Powered Scheduling**: Intelligent study time recommendations
- **Task Management**: Track assignments and deadlines
- **Calendar View**: Visual representation of your schedule

## Troubleshooting

### Google Calendar Connection Issues
- The Google Calendar integration uses pre-configured credentials
- If you encounter issues, try refreshing the page
- Make sure you're allowing pop-ups for the OAuth flow

### Canvas Integration Issues
- The Canvas integration uses a hardcoded iCal feed URL
- Update the `CANVAS_ICAL_URL` in `components/canvas-integration.tsx` with your Canvas calendar feed

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
SunHacks/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/               # Utility functions and contexts
├── hooks/             # Custom React hooks
├── data/             # Static data files
└── public/           # Static assets
```
