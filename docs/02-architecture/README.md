# Architecture And Delivery Plan

## 1. Topic
**Project title:** Phat trien he thong thuong mai dien tu tich hop module cham soc khach hang thong minh cho mat hang may tinh va phu kien.

## 2. Objectives And Significance
### 2.1. System objectives
Build an e-commerce system specialized in computers and accessories that allows customers to search, filter, compare products, build a PC configuration, check component compatibility, place orders, pay online, and receive intelligent technical support through an integrated AI care module.

The system also supports internal operations such as order processing, technical ticket handling, user and role management, SKU management, dynamic attributes, and basic system configuration.

### 2.2. Significance
This topic goes beyond a conventional e-commerce website by integrating intelligent functions such as technical consultation, PC build suggestions, and compatibility checking. That increases the practical value of the system and makes the demo closer to a real business workflow.

## 3. Actors
### 3.1. Internal actors
- Guest customer: views products, searches, filters, uses basic support functions, and registers an account.
- Registered customer: uses the full shopping flow, account management, order tracking, ticket creation, and online payment.
- Sales staff: processes orders, supports customers, and creates shipping requests.
- Technician: handles technical tickets and manages compatibility rules.
- Admin: manages users, roles, SKU data, dynamic attributes, and system settings.

### 3.2. External systems
- AI Advisor Service: supports technical chat and PC build suggestions.
- Shipping API: used for shipment creation.
- Payment Gateway (VNPAY): used for online payment flow.

## 4. Scope Definition
### 4.1. Core functions that must work
#### Customer side
- Register
- Login
- Browse product catalog
- Search and filter components
- View product details
- Compare products
- Build PC configuration
- Manage shopping cart
- Place order
- Online payment

#### Intelligent customer care
- Technical consultation chat
- Configuration suggestion
- Component compatibility checking

#### Internal operations
- Process orders
- Create shipping order
- Manage technical tickets
- Manage users and permissions
- Manage SKU and dynamic attributes

### 4.2. Functions prioritized for the first demo
- Browse catalog
- Search and filter components
- View product details
- Build PC configuration
- Compatibility checking
- AI technical consultation or build suggestion
- Add products or builds to cart
- Place order and simulate online payment
- Sales staff processes order
- Admin manages users, permissions, products, and SKU data

### 4.3. Functions moved to later phases
- Full production-grade VNPAY integration
- Full production-grade shipping integration
- Product comparison enhancement
- Ticket workflow completion
- Electronic warranty activation
- Advanced monitoring dashboard
- Deep real-time chat
- RAG/vector database from day one
- Microservices architecture

## 5. Technology Stack
### 5.1. Backend
- Node.js + Express
- ORM: Prisma or Sequelize
- Authentication: JWT
- Image upload: Multer

### 5.2. Frontend
- React + Vite
- Tailwind CSS
- React Router
- Axios

### 5.3. Database
- MySQL

### 5.4. AI
- Phase 1: OpenAI API

### 5.5. Source control
- Git repository for source code, documentation, and collaboration workflow

## 6. Architecture Orientation
### 6.1. Proposed system architecture
- Frontend web application for customer, sales, technician, and admin interfaces
- Backend REST API handling authentication, catalog, cart, orders, tickets, PC builder, and administration
- MySQL database for transactional and master data
- AI service integration layer for consultation and suggestion features
- Payment gateway integration layer for online checkout
- Shipping integration layer for shipment creation

### 6.2. Main modules
- Authentication and authorization
- Product catalog and category management
- SKU and dynamic attribute management
- PC builder and compatibility rules
- Cart and checkout
- Order management
- Ticket management
- AI advisor integration
- Admin and staff operations

### 6.3. Design artifacts
- Related docs: [requirements](/d:/Project%20CNM_MK-HB/docs/01-requirements/README.md), [database](/d:/Project%20CNM_MK-HB/docs/03-database/README.md), [api](/d:/Project%20CNM_MK-HB/docs/04-api/README.md), [ui-ux](/d:/Project%20CNM_MK-HB/docs/05-ui-ux/README.md)
- Context diagram
- Container diagram
- Component diagram
- Deployment overview

## 7. Delivery Roadmap In 6 Phases
### Phase 1. Define scope and requirements
#### 1.1. Clarify business scope
- Confirm actors, goals, mandatory functions, and demo scope
- Separate must-have, should-have, and later-phase functions
- Define external integrations: AI, payment, and shipping

#### 1.2. Confirm technology choices
- Backend: Node.js + Express
- ORM: Prisma or Sequelize
- Frontend: React + Vite + Tailwind CSS
- Database: MySQL
- AI: OpenAI API

#### 1.3. Create project repository
- Initialize Git repository
- Define branch strategy and folder structure
- Add base documentation and task tracking

### Phase 2. System design
#### 2.1. System architecture
- Define high-level modules and integration boundaries
- Draw context, container, and component diagrams

#### 2.2. Database design
- Build ERD for users, roles, products, categories, SKU, cart, orders, tickets, and compatibility rules

#### 2.3. API design
- Define REST endpoints, request/response contracts, auth rules, and error format

#### 2.4. UI wireframe
- Sketch main screens for customer, admin, sales staff, and technician flows

### Phase 3. Team work allocation
#### 3.1. Frontend responsibilities
- Catalog, product detail, cart, checkout, PC builder, AI chat UI, admin screens

#### 3.2. Backend responsibilities
- Auth, catalog APIs, PC builder logic, cart, orders, tickets, admin APIs, integrations

### Phase 4. System development
#### 4.1. Backend setup
- Project structure
- Database connection
- ORM models and migrations
- Auth and role middleware

#### 4.2. Build core features first
- Register and login
- Catalog browsing
- Search and filter
- Product detail
- Cart
- Checkout
- Order processing
- PC builder and compatibility checking

#### 4.3. Frontend implementation
- Customer storefront
- Staff and admin interfaces
- API integration and state handling

### Phase 5. Testing and completion
- Unit testing for core services
- API testing for critical flows
- Manual integration testing for end-to-end demo
- Fix defects and improve stability
- Prepare demo data

### Phase 6. Report writing and defense preparation
- Write introduction, objectives, scope, architecture, implementation, and evaluation
- Capture screenshots and demo scenarios
- Prepare presentation slides
- Rehearse defense flow and Q&A

## 8. Recommended Demo Scope
1. Customer opens the system and browses the catalog.
2. Customer searches or filters components by need.
3. Customer views product details.
4. Customer uses the PC Builder feature.
5. The system checks compatibility between selected components.
6. AI Advisor Service supports technical consultation or build suggestion.
7. Customer adds products or a build to cart.
8. Customer places an order and performs online payment in demo mode.
9. Sales staff processes the order.
10. Admin manages users, permissions, and product or SKU data.
