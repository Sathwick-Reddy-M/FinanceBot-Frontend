# **App Name**: FinView

## Core Features:

- Account Dashboard: Display a dashboard summarizing all financial accounts, grouped by type (Investments, Banking, Loans, etc.).
- Add New Account: Allow users to add a new account by selecting the account type and either entering data through a form or pasting a JSON object. Support validation of input data.
- Edit Account: Enable users to edit existing account information via a pre-populated form or JSON input.
- Delete Account: Implement a confirmation dialog before permanently removing an account from the session storage.
- Interactive Account Management: Provide clear visual distinction and interactive UI elements for adding and editing accounts, including dynamic addition/removal of fields for nested arrays (e.g., asset distributions).
- Chatbot Interaction: Incorporate a chatbot interface with distinct user and bot avatars for conversation. Send messages to the endpoint `ABC/DEF`, which persists and is sent with all other user and financial information.
- AI financial summarization: AI powered financial summarization: when available and relevant, the tool will provide tailored, specific summaries of the user's data as related to the prompt the user provides to the chat bot.

## Style Guidelines:

- Primary color: A vibrant teal (#20c997) to evoke a sense of innovation and clarity. Use this for primary buttons, active states, and key interactive elements.
- Background color: A soft off-white (#f8f9fa) to provide a clean and spacious feel, reducing eye strain and improving content focus. Use throughout the app's containers.
- Accent color: A warm amber (#ffc107) to highlight important information, CTAs, and success states. This adds a touch of energy and optimism.
- Secondary accent color: A deep purple (#6f42c1) to introduce a modern and sophisticated touch, used sparingly for secondary actions or data visualizations.
- Use a modern and clean sans-serif font like 'Inter' or 'Roboto' for optimal readability. Font sizes should be carefully chosen to establish a clear visual hierarchy.
- Implement a set of sleek, minimalist icons from a library like 'Material Icons' or 'Font Awesome'. Icons should be consistent in style and used to reinforce actions and account types.
- Adopt a flexible grid-based layout with generous spacing and padding to create a balanced and responsive design. Ensure elements are well-aligned and visually grouped for intuitive navigation.
- Incorporate subtle, modern animations and transitions to enhance the user experience without being distracting. Use smooth fades, slides, and scaling effects to provide feedback and guide the user's attention.