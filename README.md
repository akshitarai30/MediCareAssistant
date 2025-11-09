# MediCare Assist

MediCare Assist is an intelligent medication management application designed to help users track their medication schedules, manage prescriptions, and maintain their medical history in a secure and intuitive way. Built with Next.js and Firebase, it provides a seamless experience for managing personal health.

## Key Features

- **User Authentication**: Secure sign-up and login functionality using Authentication (Email/Password).
- **Medication Dashboard**: A central hub to view all current medications, their dosages, and countdowns to the next dose.
- **Add & Manage Prescriptions**: Easily add new medications, specifying dosage, timings, and the duration of the prescription.
- **Medication Tracking**: Mark medications as "Taken", "Snoozed", or "Missed". The UI provides clear visual feedback with color-coding and disables actions when a dose is already taken.
- **Dose Alerts**: Receive browser-based speech and toast notifications when a medication is due.
- **Medication History**: View a complete, date-grouped log of all medication events (Taken, Snoozed, Missed).
- **Clear History**: Option to permanently delete all medication history logs.
- **Medical Reports**: Upload, view, and delete medical documents.
- **Emergency Button**: A quick-access button to simulate contacting emergency services.
- **Responsive Design**: A clean and modern UI that works seamlessly across desktop and mobile devices.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/)
- **Form Management**: [React Hook Form](https://react-hook-form.com/)
- **UI Components**: `lucide-react` for icons, `date-fns` for date manipulation.
- **Deployment**: Ready for Vercel [medi-care-assistant.vercel.app]

## Project Structure

```
/
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── (auth)/         # Auth-related pages (login, register)
│   │   ├── history/        # Medication history page
│   │   ├── reports/        # Medical reports page
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Main dashboard page
│   ├── components/
│   │   ├── ui/             # Reusable shadcn/ui components
│   │   ├── app-header.tsx  # Main application header
│   │   ├── medication-card.tsx # Card for displaying a single medication
│   │   └── ...             # Other custom components
│   ├── firebase/
│   │   ├── config.ts       # Firebase configuration
│   │   ├── index.ts        # Firebase initialization and hooks
│   │   └── ...             # Other Firebase-related modules
│   ├── hooks/              # Custom React hooks (e.g., use-countdown)
│   ├── lib/                # Utility functions and type definitions
│   └── ...
├── docs/
│   └── backend.json        # Data structure definition for Firebase
├── public/                 # Static assets
├── firestore.rules         # Firestore security rules
├── next.config.ts          # Next.js configuration
└── package.json            # Project dependencies and scripts
```

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### Open a Local Folder

If you already have the project downloaded:
-Go to File → Open Folder...
-Select your project folder (e.g., medicare-assist)
-Install Dependencies
-In the VS Code terminal :
    cd medicare-assist
    npm install
-This will install all necessary libraries listed in your package.json.
-Once installation finishes, run:
    npm run dev
    > Local: http://localhost:3000/

Open your browser and visit : http://localhost:3000

## Available Scripts
- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production.
- `npm run start`: Starts a production server.
- `npm run lint`: Runs the linter to check for code quality issues.