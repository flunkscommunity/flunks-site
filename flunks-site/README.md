# Flunks Site

Welcome to the Flunks Site project! This application is designed to provide an interactive experience for users to navigate through different class rooms, each tailored to a specific class type.

## Project Structure

The project is organized as follows:

```
flunks-site
├── src
│   ├── windows
│   │   ├── Homebase.tsx        # Main component for the Homebase window
│   │   └── rooms
│   │       ├── GeekRoom.tsx    # Component for the Geek class room
│   │       ├── FreakRoom.tsx   # Component for the Freak class room
│   │       ├── PrepRoom.tsx     # Component for the Prep class room
│   │       └── JockRoom.tsx    # Component for the Jock class room
│   ├── components
│   │   └── DraggableResizeableWindow.tsx # Component for draggable and resizable windows
│   ├── contexts
│   │   └── WindowsContext.tsx   # Context for managing window state
│   └── fixed.ts                 # Constants and fixed values
├── package.json                 # npm configuration file
├── tsconfig.json                # TypeScript configuration file
└── README.md                    # Project documentation
```

## Features

- **Homebase Window**: The main interface where users can navigate to different class rooms.
- **Class Rooms**: Each room (Geek, Freak, Prep, Jock) has its own unique content and interactions.
- **Draggable and Resizable Windows**: Users can interact with the windows, moving and resizing them as needed.

## Getting Started

To get started with the project, clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd flunks-site
npm install
```

## Running the Application

To run the application in development mode, use the following command:

```bash
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.