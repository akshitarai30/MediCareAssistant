# MediCare Assist

MediCare Assist is an intelligent medication management application designed to help users track their medication schedules, manage prescriptions, and maintain their medical history in a secure and intuitive way. Built with Next.js and Firebase, it provides a seamless experience for managing personal health.

## Key Features

- **User Authentication**: Secure sign-up and login functionality using Firebase Authentication (Email/Password).
- **Medication Dashboard**: A central hub to view all current medications, their dosages, and countdowns to the next dose.
- **Add & Manage Prescriptions**: Easily add new medications, specifying dosage, timings, and the duration of the prescription.
- **Medication Tracking**: Mark medications as "Taken", "Snoozed", or "Missed". The UI provides clear visual feedback with color-coding and disables actions when a dose is already taken.
- **Dose Alerts**: Receive browser-based speech and toast notifications when a medication is due.
- **Medication History**: View a complete, date-grouped log of all medication events (Taken, Snoozed, Missed).
- **Clear History**: Option to permanently delete all medication history logs.
- **Medical Reports**: Upload, view, and delete medical documents (PDFs, images). Files are securely stored in Firebase Storage.
- **Emergency Button**: A quick-access button to simulate contacting emergency services.
- **Responsive Design**: A clean and modern UI that works seamlessly across desktop and mobile devices.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) for components.
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Firebase Authentication, Firebase Storage)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation.
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

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/)
