# Product Admin Dashboard

A responsive Product Admin Dashboard built with Next.js, React, Tailwind CSS, and Axios using the DummyJSON API.

The application provides authentication, product listing, search, filtering, sorting, pagination, product details, and product management features.

---

## Features

### Authentication
- Login using DummyJSON authentication API
- Protected dashboard
- Access token stored in localStorage
- Logout functionality
- Prevents unauthenticated users from accessing the dashboard

### Product Management
- View products in a responsive dashboard
- Product image
- Product title
- Category
- Price
- Rating
- Stock
- Product details page
- Add product
- Edit product
- Delete product

### Search
- Search products using the DummyJSON search API
- Debounced search input
- Search results update without unnecessary API requests
- Search resets pagination to page 1

### Category Filter
- Fetches categories from DummyJSON
- Filter products by category

### Sorting
Products can be sorted by:
- Price
- Rating
- Title

Both ascending and descending sorting are supported.

### Pagination
- Pagination implemented manually
- Page sizes:
  - 10
  - 20
  - 50
- Uses DummyJSON `limit` and `skip` parameters
- Handles invalid page values safely

### URL State
The following dashboard state is preserved in the URL:

- Page
- Page size
- Search
- Category
- Sorting

Example:

```text
/dashboard?page=2&limit=20&search=phone&category=beauty&sort=price-asc

is allows the current dashboard state to remain available after refreshing the page.

Loading, Empty and Error States

The application handles:

Loading states
Empty search results
API errors
Invalid product IDs
Invalid URL parameters
Duplicate Submission Protection

Rapid repeated actions are prevented for:

Login
Add product
Edit product
Delete product
Tech Stack
Next.js
React
TypeScript
Tailwind CSS
Axios
DummyJSON API
Git
GitHub
API

This project uses the DummyJSON API.

Base URL:

https://dummyjson.com
Authentication
POST /auth/login

Demo credentials:

Username: emilys
Password: emilyspass
Products

Get products:

GET /products

Search products:

GET /products/search?q=phone

Get product by ID:

GET /products/{id}

Add product:

POST /products/add

Update product:

PUT /products/{id}

Delete product:

DELETE /products/{id}

Get categories:

GET /products/categories
Project Structure
product-admin-dashboard/
│
├── app/
│   ├── api/
│   │   ├── axios.ts
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   └── categories.ts
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │
│   ├── products/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── new/
│   │       └── page.tsx
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── public/
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
Installation

Clone the repository:

git clone https://github.com/vidisha499/product-admin-dashboard.git

Move into the project directory:

cd product-admin-dashboard

Install dependencies:

npm install
Run the Project

Start the development server:

npm run dev

Open the application in the browser:

http://localhost:3000
Login Credentials

Use the following DummyJSON credentials:

Username: emilys
Password: emilyspass

After successful login, the user is redirected to the product dashboard.

API Architecture

API requests are separated from UI components.

The Axios instance is configured in:

app/api/axios.ts

Authentication API functions are located in:

app/api/auth.ts

Product API functions are located in:

app/api/products.ts

Category API functions are located in:

app/api/categories.ts

This keeps API communication separate from the UI and makes the code easier to maintain.

DummyJSON Mutation Handling

DummyJSON provides product mutation endpoints for testing, but changes are not permanently persisted on the server.

Because of this behavior, the application keeps the user's added, updated, and deleted product state locally so that the changes remain visible while using the application.

Local storage is used to maintain these client-side changes.

This approach allows the product management functionality to be demonstrated even though the DummyJSON backend does not permanently save mutations.

Responsive Design

The dashboard is designed for both desktop and mobile screen sizes.

Desktop

Products are displayed in a table containing:

Image
Title
Category
Price
Rating
Stock
Actions
Mobile

Products are displayed using responsive product cards.

Search and Request Handling

Product search uses a debounce mechanism so that an API request is not sent for every individual keystroke.

The application also protects the UI from outdated search results overwriting newer results.

This is particularly important when API responses take different amounts of time.

URL Parameter Validation

Dashboard URL parameters are validated before being used.

Supported page sizes are:

10
20
50

Invalid values are replaced with safe defaults.

Invalid page values such as:

?page=abc
?page=0
?page=-1

are handled safely.

Invalid sorting parameters are also ignored and replaced with the default sorting state.

Error Handling

The application handles API failures and displays appropriate error messages instead of breaking the dashboard.

Examples include:

Login failure
Product loading failure
Product update failure
Product deletion failure
Invalid product ID
Empty search results
AI Usage

AI assistance was used during development for:

Understanding the assignment requirements
Planning the project structure
Debugging development issues
Reviewing implementation approaches
Improving error handling
Understanding React and Next.js concepts
Generating development guidance

The implementation was reviewed and tested during development, and the developer is responsible for understanding the code and its behavior.

Development Decisions
Separate API Layer

API functions are kept in separate files instead of directly writing Axios requests throughout the UI.

Client-side State

React state is used for interactive dashboard features such as:

Search
Pagination
Filtering
Sorting
Editing
Deleting
Local Persistence

Local storage is used for product mutations because DummyJSON does not permanently persist those changes.

URL Synchronization

Important dashboard controls are synchronized with URL query parameters so that the dashboard state can be restored after a refresh.

Future Improvements

Possible improvements include:

Server-side authentication middleware
More advanced role-based access control
Permanent database persistence
Automated tests
More detailed product analytics
Production authentication with secure HTTP-only cookies
Author

Vidisha Dhemre

GitHub:

https://github.com/vidisha499/product-admin-dashboard


