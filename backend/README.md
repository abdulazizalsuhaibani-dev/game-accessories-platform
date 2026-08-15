# E-commerce Backend Project

## Project Overview

This is a comprehensive backend system solution for an e-commerce website that specializing in game accessories sales. The system provides a scalable and manageable infrastructure that handles essential aspects
of e-commerce operations, including product catalog management, order processing,payment handling, and more.

## Product Display Structure

The back-end system organizes the game accessories inventory into a multi-level product catalog. At the top level are broad product categories, such as Mouses and Keyboards.

Within each primary category, there are granular subcategories that is sorted by brands. For instance, the Headsets category includes brands like Razer, SteelSeries, and Hyper X.

**(Categories -> Subcategories -> Individual Products).**

This hierarchical structure allows customers to easily navigate the catalog and find the exact furniture pieces they need. The backend efficiently manages this taxonomy, ensuring fast access and seamless updates to categories, subcategories, and products.

## Features

- **User Management**

  - Create new user
  - User authentication with JWT token
  - Role-based access control (Admin, Customer)
  - Display all users
  - Display specific user
  - Update user information
  - Check for user Username , Email and phone number
  - Check null values
  - Delete specific user

- **Product Management**:

  - Products can be searched by its names.
  - Products can be filtered based on price range , color , and product name.
  - Products can be sorted based on the added date (New Arrivals) , SKU (low stock) , and Price.
  - The search results highlight the products whose detailed descriptions best align with the user's search query.

- **Order Management**:

  - Create new order.
  - Retrieve all pending and completed orders included with pagination.
  - Update current order status along with its shipping date.
  - Cancel order depending in its status.

- **SubCategory**

  - Search Subcategories with Pagination.
  - Retrieve all Products within a Subcategory.
  - Add/Update/Delete Products within a Subcategory.

- **Payment**

  - Adding a payment with active coupon(isActive: true).
  - Adding a payment with inactive coupon(isActive: false). (e.g. using outdated/wrong coupon)

- **Cart**

  - Using Cart Details to improve the management of the products details inside the carts.
  - Automatically calculate the subtotal of every product inside the carts.
  - Automatically calculate the price of the carts.

- **Review**

  - The user can post a review with or without a comment, but it must include a ratting.
  - Automatically update the average rating result of each product when a new review is posted.

## Technologies Used

- **.Net 8**: Web API Framework
- **Entity Framework Core**: ORM for database interactions
- **PostgreSQl**: Relational database for storing data
- **JWT**: For user authentication and authorization
- **AutoMapper**: For object mapping
- **Swagger**: API documentation

## Prerequisites

- .Net 8 SDK
- SQL Server
- VSCode

## Getting Started

### 1. Clone the repository:


```bash 
git clone git@github.com:your-username/sda-3-online-Backend_Teamwork.git
```

### 2. Setup database

- Make sure PostgreSQL Server is running
- Create `appsettings.json` file
- Update the connection string in `appsettings.json`

```json
{
  "ConnectionStrings": {
    "Local": "Server=localhost;Database=ECommerceDb;User Id=your_username;Password=your_password;"
  }
}
```

- Run migrations to create database

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

- Run the application

```bash
dotnet watch
```

The API will be available at: `http://localhost:5228`

### Swagger

- Navigate to `http://localhost:5228/swagger/index.html` to explore the API endpoints.

## Project structure

```bash
|-- Controllers # API controllers with request and response
|-- Database # DbContext and Database Configurations
|-- DTOs # Data Transfer Objects
|-- Entities # Database Entities (User, Product, Category, Order)
|-- Middleware # Logging request, response and Error Handler
|-- Repositories # Repository Layer for database operations
|-- Services # Business Logic Layer
|-- Utils # Common logics
|-- Migrations # Entity Framework Migrations
|-- Program.cs # Application Entry Point
```

## API Endpoints

### User

- **POST** `/api/v1/users` – Create a new user.
- **POST** `/api/v1/users/signIn` – User login and retrieve JWT token.
- **GET** `/api/v1/users` – Retrieve all users.
- **GET** `/api/v1/users/{id}` – Retrieve a specific user by ID.
- **PUT** `/api/v1/users/{id}` – Update user information by ID.
- **DELETE** `/api/v1/users/{id}` – Delete a user by ID.

### Category

- **POST** `/api/v1/categories` – Create a new category.
- **GET** `/api/v1/categories` – Retrieve all categories.
- **GET** `/api/v1/categories/{id}` – Retrieve a specific category by ID.
- **PUT** `/api/v1/categories/{id}` – Update category by ID.
- **DELETE** `/api/v1/categories/{id}` – Delete a category by ID.

### Subcategory

- **POST** `/api/v1/subcategories` – Create a new subcategory.
- **POST** `/api/v1/subcategories/{subCategoryId}/products` – Add a new product to a subcategory.
- **GET** `/api/v1/subcategories` – Retrieve all subcategories including its products.
- **GET** `/api/v1/subcategories/{id}` – Retrieve a specific subcategory by ID.
- **GET** `/api/v1/subcategories/products` – Retrieve all products in all subcategories with optional sorting, filtering, searching, and pagination.
- **GET** `/api/v1/subcategories/{subCategoryId}/products` – Retrieve all products in specific subcategory with optional sorting, filtering, searching, and pagination.
- **GET** `/api/v1/subcategories/products/{productId}` – Retrieve a specific product by ID within a subcategory.
- **GET** `/api/v1/subcategories/search` – Search for subcategories with pagination.
- **PUT** `/api/v1/subcategories/{subCategoryId}` – Update a subcategory by ID.
- **PUT** `/api/v1/subcategories/products/{productId}` – Update a product by ID within a subcategory.
- **DELETE** `/api/v1/subcategories/{subCategoryId}` – Delete a subcategory by ID.
- **DELETE** `/api/v1/subcategories/products/{productId}` – Delete a product by ID within a subcategory.

### Product

- **POST** `/api/v1/products` – Create a new product.
- **GET** `/api/v1/products` – Retrieve all products with optional sorting, filtering, searching, and pagination.
- **GET** `/api/v1/products/{productId}` – Retrieve a specific product by ID.
- **PUT** `/api/v1/products/{productId}` – Update a product by ID.
- **DELETE** `/api/v1/products/{productId}` – Delete a product by ID.

### Cart

- **POST** `/api/v1/carts` – Create a new cart.
- **GET** `/api/v1/carts` – Retrieve all carts.
- **GET** `/api/v1/carts/{id}` – Retrieve a specific cart by ID.
- **DELETE** `/api/v1/carts/{id}` – Delete a cart by ID.

### Payment

- **POST** `/api/v1/payments` – Create a new payment.
- **GET** `/api/v1/payments/{paymentId}` – Retrieve a specific payment by ID.
- **PUT** `/api/v1/payments/{paymentId}` – Update a payment by ID.
- **DELETE** `/api/v1/payments/{paymentId}` – Delete a payment by ID.

### Coupon

- **POST** `/api/v1/coupons` – Create a new coupon.
- **GET** `/api/v1/coupons` – Retrieve all coupons.
- **GET** `/api/v1/coupons/{id}` – Retrieve a specific coupon by ID.
- **PUT** `/api/v1/coupons/{id}` – Update a coupon by ID.
- **DELETE** `/api/v1/coupons/{id}` – Delete a coupon by ID.

### Order

- **POST** `/api/v1/orders/checkout` – Create a new order.
- **GET** `/api/v1/orders` – Retrieve all orders.
- **GET** `/api/v1/orders/{orderId}` – Retrieve a specific order by ID.
- **GET** `/api/v1/orders/user/{userId}` – Retrieve all pending orders by user ID.
- **GET** `/api/v1/orders/user/{userId}/orderHistory` – Retrieve delivered orders by user ID.
- **PUT** `/api/v1/orders/{orderId}` – Update an order by ID.
- **DELETE** `/api/v1/orders/{orderId}` – Delete an order by ID.

### Review

- **GET** `/api/v1/reviews` – Retrieve all reviews for all products.
- **GET** `/api/v1/reviews/{id}` – Retrieve a specific review by ID.
- **POST** `/api/v1/reviews` – Add a review to a product.
- **PUT** `/api/v1/reviews/{id}` – Update a review by ID.
- **DELETE** `/api/v1/reviews/{id}` – Delete a review by ID.

---

## Deployment

The application is deployed and can be accessed at: [ https://game-accessories-api.onrender.com ]

## Team Members

- **Leader** : Talal Alqarni (@TalalMAlqarni )
- **Member #1** : Abdulaziz Alsuhaibani (@ama47)
- **Member #2** : Jomana Mahjoob (@wbznan4)
- **Member #3** : Raghad Alessa (@RaghadAdel7)
- **Member #4** : Razan Altowairqi (@razanmtw17)

## License

This project is licensed under the MIT License.
