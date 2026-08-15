# Game Accessories Store

## Project Overview

This is a comprehensive full-stack solution for an e-commerce website that specializing in game accessories sales. The system provides a scalable and manageable infrastructure that handles essential aspects
of e-commerce features, including product catalog management, order processing, payment handling, and more.

## Product Display Structure

The project system organizes the game accessories inventory into a multi-level product catalog. At the top level are broad product categories, such as Mouses and Keyboards.

Within each primary category, there are granular subcategories that is sorted by brands. For instance, the Headsets category includes brands like Razer, SteelSeries, and Hyper X.

**(Categories -> Subcategories -> Individual Products).**

This hierarchical structure allows customers to easily navigate the catalog and find the exact accessories they need. The front-end efficiently help customers to ensure fast access and friendly view to products, adding to cart and ordering products.

## Features

- **User**

  - Register new user
  - User authentication with JWT token
  - Role-based access control (Admin, Customer)
  - Display all users for admin
  - Display a user profile
  - Update user information via profile
  - Validation for user's Username, Email, phone number and password
  - Delete specific user by admin

- **Product**

  - Products can be searched by its names.
  - Products can be filtered based on price range, color and product name.
  - The search results highlight the products whose detailed descriptions best align with the user's search query.
  - Admin can add, update and delete products.

- **Order**

  - Create new order in checkout page.
  - Admin can view all orders in dashboard

- **Payment**

  - User can choose payment during checkout

- **Cart**

  - Using Cart Details to improve the management of the products details inside the carts.
  - Automatically calculate the subtotal of every product inside the carts.
  - Automatically calculate the price of the carts.

- **Review**

  - The user can post a review with or without a comment, but it must include a ratting.
  - Automatically update the average rating result of each product when a new review is posted.

## Technologies Used

- **React**: Library for Building user interfaces
- **Tailwind**: Utility-first CSS framework
- **Material UI**: React components library based on Google's Material Design
- **Axios**: Promise based HTTP client for the browser and node.js
- **Yup**: Schema builder for input parsing and validation

## Prerequisites

- .Net 8 SDK
- SQL Server
- VSCode
- Node.js

## Getting Started

### 1. Clone the repository

```bash
git clone git@github.com:ama_47/sda-3-online-FE-repo.git
```

### 2. Install packages

- Make sure you have Node.js, if you have not installed it yet, download it via: `https://nodejs.org/en/download/package-manager`

- Run the following command to install the required packages:

```bash
npm install
```

### 3. Run the API server:

Make sure to run the API by:

```bash
dotnet run
```

The API is available at: `https://game-accessories-api.onrender.com`

### 4. Run web server:

Now, you run the website by:

```bash
npm start
```

## Project structure

```bash
|-- Components # the main UI building blocks.
|-- Pages # the root for page templates
| App.js # The root component of the application
| Index.js # Main entry point
```

## License

This project is licensed under the MIT License.

## Note

Products information are fetched via `https://www.bestbuy.com`.
