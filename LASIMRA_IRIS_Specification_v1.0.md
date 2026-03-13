# LAGOS STATE INFRASTRUCTURE MAINTENANCE AND REGULATORY AGENCY (LASIMRA)

## Data Visualization Web Application
### IRIS — Infrastructure Regulatory Intelligent System
### Software Requirements & Technical Specification

**Version 1.0 | March 2026**
*Prepared for LASIMRA Digital Transformation Initiative*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Background & Context](#3-background--context)
4. [Project Objectives](#4-project-objectives)
5. [Scope of Work](#5-scope-of-work)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Technical Architecture](#8-technical-architecture)
9. [API Specification](#9-api-specification)
10. [IRIS Database — LASIMRA_IRIS](#10-iris-database--lasimra_iris)
11. [IIS Deployment Guide](#11-iis-deployment-guide)
12. [Security Considerations](#12-security-considerations)
13. [Delivery Milestones](#13-delivery-milestones)
14. [Assumptions & Constraints](#14-assumptions--constraints)
15. [Glossary](#15-glossary)

---

## 1. Executive Summary

This document defines the software requirements and technical architecture for LASIMRA's IRIS — Infrastructure Regulatory Intelligent System — an internal and public-facing analytics platform that aggregates infrastructure permit data, regulatory activity, and geospatial records from an Azure SQL database and renders them as interactive charts, data grids, maps, and real-time dashboards.

The application will be built with Node.js (Express) on the backend and deployed on Internet Information Services (IIS) on Windows Server via the iisnode module.

---

## 2. Project Overview

| Field | Detail |
|---|---|
| **Client** | Lagos State Infrastructure Maintenance and Regulatory Agency (LASIMRA) |
| **Website** | https://lasimra.gov.ng |
| **Project Type** | Internal + Public-Facing Analytics & Visualization Platform |
| **Version** | 1.0 — Initial Release |
| **Target Go-Live** | Q3 2026 |
| **Backend** | Node.js + Express |
| **Database** | Azure SQL Database |
| **Hosting** | IIS on Windows Server (via iisnode) |
| **Frontend** | HTML5 / CSS3 / JavaScript + Chart.js + Leaflet.js + AG Grid + Socket.io |

---

## 3. Background & Context

LASIMRA is the Lagos State agency responsible for regulating and overseeing the deployment and maintenance of utility infrastructure across Lagos — including fiber optic right-of-way (ROW), gas pipelines, power lines, and telecommunications towers and masts. As Lagos continues its growth as a megacity, LASIMRA processes a high volume of permit applications, inspection reports, and compliance records on a daily basis.

Currently, infrastructure data is fragmented across internal systems with limited ability to visualize trends, permit status distributions, or geospatial infrastructure density. This project addresses that gap by providing a centralized, real-time IRIS platform.

---

## 4. Project Objectives

- Provide real-time visibility into permit applications across all infrastructure categories (Fiber-ROW, Gas-ROW, Power-ROW, Tower & Mast).
- Display geospatial data on interactive maps showing infrastructure density and permit locations across Lagos State LGAs.
- Enable filtering, searching, and export of regulatory records via interactive data grids.
- Surface KPIs and trends via charts and dashboards accessible to LASIMRA staff and authorized stakeholders.
- Ensure seamless, secure connectivity to the Azure SQL backend with role-based data access.
- Deploy reliably on IIS within LASIMRA's existing Windows Server infrastructure.

---

## 5. Scope of Work

### 5.1 In Scope

- Backend REST API (Node.js/Express) connecting to Azure SQL Database.
- Interactive dashboard with real-time KPI cards and summary statistics.
- Bar charts, line charts, pie/doughnut charts, and area charts using Chart.js.
- Geospatial map visualization using Leaflet.js with Lagos LGA boundary overlays.
- Tabular data grids with sort, filter, pagination, and CSV export using AG Grid.
- Real-time data push for live permit activity updates via Socket.io and WebSockets.
- Role-based access: Admin, Analyst, and Public View tiers.
- IIS deployment configuration including web.config and iisnode setup.

### 5.2 Out of Scope

- Modifications to the existing LASIMRA permit application portal (s-auto.solutions).
- Mobile native apps (iOS/Android) — the web app will be responsive but not native.
- Data entry or permit submission workflows — this is a read/visualization layer only.
- Third-party BI tools (Power BI, Tableau) integration in v1.0.

---

## 6. Functional Requirements

### 6.1 Dashboard Module

- Display KPI cards: Total Permits Issued (MTD/YTD), Pending Applications, Approved vs Rejected rate, Active Inspections.
- Auto-refresh KPI cards every 30 seconds via Socket.io.
- Date range filter (today, last 7 days, last 30 days, custom range) applied globally across the dashboard.
- Permit category filter: All, Fiber-ROW, Gas-ROW, Power-ROW, Tower & Mast.

### 6.2 Charts & Graphs Module

- Monthly permit application trend — Line chart (12-month rolling window).
- Permit status breakdown — Doughnut chart (Pending / Approved / Rejected / Suspended).
- Permit type distribution — Horizontal bar chart comparing volumes across infrastructure categories.
- Revenue vs. target (permit fees collected) — Grouped bar chart by month.
- Inspector activity — Bar chart showing inspection count per officer over selected period.
- All charts must support click-to-drill-down to underlying records in the data grid.

### 6.3 Geospatial Map Module

- Interactive map centred on Lagos State, built with Leaflet.js.
- Choropleth layer showing permit density per LGA (colour-coded by volume).
- Point markers for individual infrastructure installations — clickable to show permit details popup.
- Layer toggles: Fiber, Gas, Power, Tower layers shown/hidden independently.
- Heatmap overlay option for high-density infrastructure corridors.
- Support for both OpenStreetMap tiles and Azure Maps tile service.

### 6.4 Data Grid Module

- Tabular view of all permit records with columns: Permit ID, Applicant, Category, LGA, Submission Date, Status, Assigned Officer, Expiry Date.
- Server-side pagination (50 records per page default, configurable).
- Column-level filtering and multi-column sorting.
- Global search across Permit ID and Applicant Name fields.
- Export to CSV and Excel (XLSX).
- Row-click to open full permit detail side panel.

### 6.5 Real-Time Module

- Live activity ticker showing the last 10 permit events (new submission, status change, payment received).
- WebSocket connection via Socket.io; reconnection with exponential backoff on disconnect.
- Visual indicator (green/amber/red) showing live connection status.

---

## 7. Non-Functional Requirements

| Attribute | Requirement |
|---|---|
| **Performance** | Dashboard initial load < 3 seconds on 10 Mbps connection. API responses < 500ms for paginated queries. |
| **Scalability** | API must handle 200 concurrent users without degradation. Connection pooling via mssql package (max 20 connections). |
| **Security** | JWT-based authentication. Azure SQL credentials stored in environment variables only — never in source code. HTTPS enforced via IIS SSL binding. |
| **Availability** | Target 99.5% uptime during business hours (Mon–Fri, 8am–6pm WAT). IIS Application Pool auto-restart on failure. |
| **Browser Support** | Latest 2 versions of Chrome, Edge, Firefox, Safari. Responsive layout for tablet (768px+) and desktop (1024px+). |
| **Accessibility** | WCAG 2.1 Level AA compliance for public-facing views. |
| **Logging** | Structured request logging via Morgan. Errors logged to iisnode log folder and optionally to Azure Monitor. |

---

## 8. Technical Architecture

### 8.1 Architecture Diagram

```
[Browser Client]  <--HTTPS-->  [IIS + iisnode]  <-->  [Node.js/Express API]  <-->  [Azure SQL Database]
                                      |
                               [Socket.io WS Server]
                                      |
                            [Real-time Event Emitter]
```

### 8.2 Tech Stack Detail

| Component | Technology |
|---|---|
| **Runtime** | Node.js v20 LTS |
| **Web Framework** | Express 4.x |
| **IIS Integration** | iisnode v0.2.26 — routes IIS requests to Node.js process |
| **Azure SQL Driver** | mssql v10.x (uses tedious under the hood) |
| **Real-time** | Socket.io v4.x |
| **Charts** | Chart.js v4.x |
| **Maps** | Leaflet.js v1.9.x + Leaflet.heat (heatmap) + custom GeoJSON LGA boundaries |
| **Data Grid** | AG Grid Community v31.x |
| **Auth** | jsonwebtoken (JWT) + bcryptjs for password hashing |
| **Logging** | Morgan (HTTP) + Winston (application) |
| **Process Manager** | iisnode manages process lifecycle in production; nodemon in dev |

### 8.3 Project Folder Structure

```
/lasimra-iris-app
  ├── server.js                  # Express app entry point
  ├── web.config                 # IIS + iisnode routing config
  ├── package.json
  ├── .env.example               # Environment variable template
  ├── /config
  │   └── db.js                  # Azure SQL connection pool
  ├── /routes
  │   ├── auth.js                # Login / JWT issuance
  │   ├── permits.js             # Permit CRUD endpoints
  │   ├── stats.js               # Aggregated KPI endpoints
  │   └── geo.js                 # Geospatial data endpoints
  ├── /middleware
  │   ├── auth.js                # JWT verification middleware
  │   └── errorHandler.js
  ├── /sockets
  │   └── permitEvents.js        # Socket.io real-time event handlers
  └── /public
      ├── index.html             # Main SPA shell
      ├── /js
      │   ├── dashboard.js
      │   ├── charts.js
      │   ├── maps.js
      │   ├── grid.js
      │   └── realtime.js
      └── /css
          └── styles.css
```

---

## 9. API Specification

| Endpoint | Description |
|---|---|
| `GET /api/stats/kpis` | Returns KPI summary: total permits, pending count, approval rate, active inspections. Supports `?from=&to=` date filters. |
| `GET /api/stats/trends` | Monthly permit counts for the last 12 months, grouped by category. |
| `GET /api/permits` | Paginated permit list. Params: `page`, `limit`, `status`, `category`, `lga`, `search`. |
| `GET /api/permits/:id` | Full detail record for a single permit. |
| `GET /api/geo/permits` | GeoJSON FeatureCollection of all permit point locations for map rendering. |
| `GET /api/geo/lga-density` | Per-LGA permit count for choropleth layer. |
| `POST /api/auth/login` | Accepts `{email, password}`; returns signed JWT (24hr expiry). |
| `WS /socket.io` | Real-time channel. Emits: `permit:new`, `permit:updated`, `permit:statusChanged` events. |

---

## 10. IRIS Database — LASIMRA_IRIS

The IRIS application connects to the **LASIMRA_IRIS** Azure SQL database using the **SmartBoxData** schema. All tables reside within this schema and were generated on 11 March 2026. Connection is established via the mssql Node.js package with a persistent connection pool.

### 10.1 Connection Configuration

Connection is established using the mssql package with the following required environment variables:

```
DB_SERVER=<your-server>.database.windows.net
DB_NAME=LASIMRA_IRIS
DB_USER=<sql-username>
DB_PASS=<sql-password>
DB_ENCRYPT=true
```

A connection pool (max 20, min 2) is initialised once at application startup and reused across all requests.

### 10.2 Database Schema — SmartBoxData

All tables belong to the `[SmartBoxData]` schema within the LASIMRA_IRIS database. The schema covers permit requests, payments, site inspections, staff, surveillance, and reference/lookup data.

---

#### Core Transaction Tables

| Table | Description |
|---|---|
| `LASIMRA_Request_SMO` | Central permit request table. Columns: `RequestID`, `CustomerID`, `RefNo`, `StatusID`, `RequestTitle`, `ApplicationDate`, `CommencementDate`, `ApprovalDate`, `IsInstalled`, `IsRenewed`, `ProcessType`, `EngineerID`, `RoWProjectName`, `RoWProjectCategoryId`, `InspectionVisitDate`, `WGuid`, `Pay4it`. |
| `LASIMRA_Payment_SMO` | Full payment lifecycle. Columns: `RequestID`, `CustomerID`, `PaymentFor`, `TxtRef`, `Status`, `flwRef`, `PaymentMode`, `AmountRequested`, `AmountPaid`, `CustomerEmail`, `ReturnStatus`, `ReturnChargeCode`, `IsCancelled`, `HostedPaymentLink`, `RequestStatus`, `TimeStamp`, `BillPDFID`, `paymentRef`, `PaymentStatus`, `PaymentStatusMessage`, `RevenuCode`, `AgencyCode`. |
| `LASIMRA_Permits_SMO` | Issued permit documents. Columns: `RequestID`, `Permit` (document/link), `UploadDate`, `CreatedBy`. |

#### Customer & Company Tables

| Table | Description |
|---|---|
| `LASIMRA_CustomerDetails_SMO` | Registered applicants/customers. Columns: `CustomerId`, `CustomerName`, `OfficePhone`, `RCNO`, `OfficeAddress`, `ContactPersonName`, `ContactPersonPhoneNo`, `ContactPersonEmail`, `IsALTON`, `StatusId`, `Arrears`, `ContactPersonUserID`, `VerificationCode`, `IsVerified`. |
| `LASIMRA_ConstructionCompanyDetails_SMO` | Construction company details linked to requests. Columns: `RequestID`, `Name`, `Office_Address`, `Phone_No`, `RC_NO`, `Contact_Person_Name`, `Contact_Person_Phone`, `Contact_Person_Email`, `SiteRefNo`. |

#### Tower & Mast Tables

| Table | Description |
|---|---|
| `LASIMRA_TowerMast_Request_SMO` | Tower/mast permit requests. Columns: `MastID`, `RequestID`, `Comment`, `LocalGovernmentArea_`, `SiteNameSiteID`, `ConsultantID_`, `CountOfMasts`, `SiteAssessmentFees`, `SiteRefNo`, `ReqRefNo`. |
| `LASIMRA_TowerMast_Reqeust_SMO` | Tower/mast site technical details. Columns: `MastID`, `RequestID`, `SiteAddress`, `Longitude`, `Latitude`, `Elevation`, `LoadCapacity`, `RFRadiationLevel`, `RadiusOfPotentialHazardArea`, `SiteCategory`, `TypeOfStructure`, `StructureHeight`, `ItemFee`, `SiteRefNo`. |
| `LASIMRA_TowerMastDetails_SMO` | Extended mast record details. Columns: `Reference_Number`, `Site_Address`, `Local_Government_Area`, `Longitude`, `Latitude`, `Elevation`, `Load_Capacity`, `RF_Radiation_Level`, `Radius_of_Potential_Hazard_Area`, `Site_Category`, `Type_of_Structure`, `StructureHeight`, `Comment`. |
| `LASIMRA_MAST_Consultants_Details_SMO` | Consultant organisations for mast permits. Columns: `NameOfOrganization`, `Email`, `ContactPerson`, `OfficePhoneNo`, `RCNO`, `IsActive`, `SiteRefNo`. |
| `LASIMRA_MASTFees_SMO` | Fee schedule for mast permits. Columns: `Code`, `Fee`, `ALTONFees`. |

#### Site Inspection Tables

| Table | Description |
|---|---|
| `LASIMRA_SiteInspection_SMO_1` | Site inspection records. Columns: `RequestID`, `InspectionDate`, `ROWSpecification`, `Client`, `Contractor`, `ContactPersonNumber`, `LocationRoutes`, `TotalDistance`, `Remarks`, `RouteBreakDownAsphalt`, `RouteBreakDownConcrete`, `RouteBreakDownPavingStone`, `RouteBreakDownLawan`, `RouteBreakDownSoilEarth`, `RouteBreakDownThrustBoring`, `RouteBreakDownBridgeAttachment`, `RouteBreakDownNumberOfValvePit`, `RouteBreakDownJunctionBox`, `RouteBreakDownLeasingDuct`. |
| `LASIMRA_SiteInspectionDetails_SMO` | Detailed route breakdown measurements (decimal values). Columns: `RequestID`, `LocationRoutes`, `RouteBreakDownAsphalt`, `RouteBreakDownConcrete`, `RouteBreakDownPavingStone`, `RouteBreakDownLawan`, `RouteBreakDownSoilEarth`, `RouteBreakDownThrustBoring`, `RouteBreakDownBridgeAttachment`, `RouteBreakDownNumberOfValvePit`, `JunctionBox`, `LeasingDuct`. |

#### Surveillance Tables

| Table | Description |
|---|---|
| `LASIMRA_SurvillanceRequest_SMO` | Surveillance/violation requests. Columns: `RequestID_1`, `SiteName`, `SiteAddress`, `LGAID`, `Subject`, `InfrastructureCategory`, `IsCustomerRegistered`, `CustomerID`, `IsEquipmentRegistered`, `RequestID`, `ViolationType`, `Overview`, `Details`, `ActionTaken`, `PenaltyFees`, `GroupID`. |
| `LASIMRA_SurveillanceGroups_SMO` | Surveillance team groups. Columns: `ID`, `GroupName`. |
| `LASIMRA_SurveillanceTeams_SMO` | Team members per surveillance group. Columns: `GroupName` (FK), `UserName`, `UserID`. |

#### Staff & Engineer Tables

| Table | Description |
|---|---|
| `LASIMRA_StaffDetails_SMO` | LASIMRA internal staff. Columns: `Name`, `EmailAddress`, `PhoneNumber`, `Designation`, `Role`. |
| `EngineerInformations` | Field engineers for site inspections. Columns: `EngineerName`, `EngineerPhoneNumber`, `EngineerEmail`, `EngineerUserID`. |
| `LASIMRA_CommercialDepartmentMembers_SMO` | Commercial/SMO area officers. Columns: `AreaOfficeName`, `AreaOfficerEmail`, `Active`. |
| `LASIMRA_ROWBillGenerationTeam_SMO` | Staff authorised to generate ROW bills. Columns: `UserName`, `UserID`, `ProjectCategoryID`. |

#### Reference / Lookup Tables

| Table | Description |
|---|---|
| `LASIMRA_LocalGovernment_SMO` | Lagos LGA master list. Columns: `LGACode`, `LGAName`, `AreaOfficerName`, `AreaOfficerEmail`, `Active`. |
| `LASIMRA_InfrastrucureCategory_SMO` | Infrastructure types (Fiber, Gas, Power, Tower). Columns: `InfrastructureID`, `InfrastructureName`, `InfrastructureCode`. |
| `LASIMRA_StatusList_SMO` | All possible request statuses. Columns: `Status`, `StatusCode`, `Category`. |
| `LASIMRA_ROWProcjectCategory_SMO` | ROW project categories. Columns: `ProjectCategoryID`, `ProjectCategoryName`, `ProjectCategoryCode`. |
| `LASIMRA_ROWNumberOfWays_SMO` | ROW number-of-ways options. Columns: `NumberOfWaysName`, `NumberOfWaysCode`. |
| `LASIMRA_SiteCategory_SMO` | Site classification categories. Columns: `Name`, `Code`. |
| `LASIMRA_StructureType_SMO` | Structure types for masts. Columns: `StructureTypeName`, `StructureTypeCode`. |
| `LASIMRA_ViolationTypes_SMO` | Violation classification. Columns: `ViolationName`, `ViolationCode`. |
| `LASIMRA_SystemKeys_SMO` | Application-level configuration keys. Columns: `KeyCode`, `Key`. |

---

## 11. IIS Deployment Guide

### Prerequisites on Windows Server

- IIS 10 (Windows Server 2016+) with WebSocket Protocol feature enabled.
- Node.js v20 LTS installed and available in system PATH.
- iisnode module installed (x64 MSI from the iisnode GitHub releases).
- URL Rewrite IIS module installed.

### web.config Requirements

- iisnode handler mapped to `server.js` as the entry point.
- URL Rewrite rule to forward all non-static requests to `server.js`.
- Static file exclusions for `/public/**` served directly by IIS.
- `NODE_ENV`, `PORT`, and all `DB_` variables set as iisnode `environmentVariables`.

### Application Pool Settings

- Managed Pipeline Mode: **Integrated**.
- .NET CLR Version: **No Managed Code**.
- Enable 32-Bit Applications: **False**.
- Idle Time-out: **0** (disable recycling during business hours).
- WebSocket support: **Enabled** in IIS feature settings.

---

## 12. Security Considerations

- All API routes (except `/api/auth/login` and public stats) require a valid JWT in the `Authorization: Bearer <token>` header.
- Three roles: **ADMIN** (full access), **ANALYST** (read + export), **PUBLIC** (aggregated stats and map only — no PII).
- HTTPS enforced on IIS with a minimum TLS 1.2 binding; HTTP redirected to HTTPS.
- Azure SQL credentials stored exclusively in IIS environment variables — never committed to source control.
- Input sanitisation on all query parameters to prevent SQL injection (parameterised queries via mssql).
- Rate limiting middleware (express-rate-limit) on authentication endpoints: max 10 attempts per 15 minutes.
- CORS restricted to LASIMRA-approved origins only.

---

## 13. Delivery Milestones

| # | Milestone | Deliverables | Target Date |
|---|---|---|---|
| M1 | Project Setup & Architecture | Azure SQL schema setup, IIS config templates, project scaffolding | Apr 2026 |
| M2 | Backend API Development | All REST endpoints, JWT auth, Azure SQL integration, Socket.io | May 2026 |
| M3 | Frontend Dashboard & Charts | KPI cards, Chart.js charts, date/category filters | May 2026 |
| M4 | Geospatial Map Module | Leaflet.js map, LGA choropleth, permit point markers, layer toggles | Jun 2026 |
| M5 | Data Grid & Export | AG Grid table, filters, pagination, CSV/Excel export | Jun 2026 |
| M6 | Real-time & Integration | Socket.io live feed, drill-down from charts to grid | Jun 2026 |
| M7 | Testing & IIS Staging Deploy | UAT, performance testing, IIS deployment, SSL configuration | Jul 2026 |
| M8 | Production Launch | Go-live on LASIMRA IIS server, staff training, documentation | Jul 2026 |

---

## 14. Assumptions & Constraints

- LASIMRA has an existing Azure SQL Database instance named LASIMRA_IRIS with the SmartBoxData schema already in place; this project reads from it and does not modify the underlying schema.
- A Windows Server with IIS 10 is available for deployment. iisnode and URL Rewrite modules will be installed by the server administrator prior to deployment.
- A valid SSL certificate for the application domain will be provided by LASIMRA IT or procured separately.
- LGA boundary GeoJSON data will be sourced from publicly available Nigerian administrative boundary datasets (e.g. GADM).
- Real-time events are driven by polling the `LASIMRA_Request_SMO` and `LASIMRA_Payment_SMO` tables at a configurable interval (default: every 10 seconds). SQL Server Change Tracking may be enabled in a later version for true push notifications.

---

## 15. Glossary

| Term | Definition |
|---|---|
| **IIS** | Internet Information Services — Microsoft's web server for Windows. |
| **iisnode** | An open-source IIS module that hosts Node.js applications inside IIS worker processes. |
| **ROW** | Right-of-Way — a legal permission to deploy infrastructure across public land. |
| **JWT** | JSON Web Token — a compact, self-contained token used for API authentication. |
| **LGA** | Local Government Area — the administrative subdivision unit used in Lagos State. |
| **KPI** | Key Performance Indicator — a measurable metric used to evaluate performance. |
| **GeoJSON** | An open standard format for encoding geographic data structures as JSON. |
| **Socket.io** | A JavaScript library enabling real-time, event-driven communication via WebSockets. |
| **AG Grid** | A high-performance JavaScript data grid library supporting large datasets. |
| **SmartBoxData** | The SQL Server schema name under which all LASIMRA_IRIS tables reside. |
| **IRIS** | Infrastructure Regulatory Intelligent System — the name of this web application. |

---

*LASIMRA — Lagos State Infrastructure Maintenance and Regulatory Agency | lasimra.gov.ng | Confidential — For Internal Use*
*Version 1.0 | March 2026*
