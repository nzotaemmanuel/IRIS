/* 
IRIS KPI DASHBOARD QUERIES
Source of Truth: LASIMRA_IRIS Schema Discovery 2026-03-16
*/

-- ==========================================
-- DOMAIN 1: STRUCTURES (Infrastructure)
-- ==========================================

-- S1: Total Structures (Live Count)
-- REAL-TIME KPI
SELECT COUNT(*) as TotalStructures 
FROM [SmartBoxData].[LASIMRA_TowerMastDetails_SMO];

-- S2: Structures by Category (Distribution)
SELECT 
    sc.Name as Category, 
    COUNT(t.ID) as Count
FROM [SmartBoxData].[LASIMRA_TowerMastDetails_SMO] t
LEFT JOIN [SmartBoxData].[LASIMRA_SiteCategory_SMO] sc ON t.Site_Category = sc.ID
GROUP BY sc.Name;

-- S3: Asset Registration Rate (MTD/QTD/YTD proxy via Requests)
-- Filters: ApplicationDate
SELECT 
    FORMAT(r.ApplicationDate, 'yyyy-MM') as Month,
    COUNT(*) as Registrations
FROM [SmartBoxData].[LASIMRA_Request_SMO] r
WHERE r.RequestTitle LIKE '%MAST%' OR r.RequestTitle LIKE '%ROW%'
GROUP BY FORMAT(r.ApplicationDate, 'yyyy-MM')
ORDER BY Month DESC;

-- S4: Structural Compliance Status
SELECT 
    sl.Status,
    COUNT(r.RequestID) as Count
FROM [SmartBoxData].[LASIMRA_Request_SMO] r
INNER JOIN [SmartBoxData].[LASIMRA_StatusList_SMO] sl ON r.StatusID = sl.ID
WHERE sl.Category = 'RoW'
GROUP BY sl.Status;

-- S5: Asset Age Profile (Grouping by registration year)
SELECT 
    YEAR(r.ApplicationDate) as RegYear,
    COUNT(*) as Count
FROM [SmartBoxData].[LASIMRA_Request_SMO] r
WHERE r.ApplicationDate IS NOT NULL
GROUP BY YEAR(r.ApplicationDate)
ORDER BY RegYear ASC;


-- ==========================================
-- DOMAIN 2: CUSTOMERS
-- ==========================================

-- C1: Active Customer Base
SELECT COUNT(*) as ActiveCustomers 
FROM [SmartBoxData].[LASIMRA_CustomerDetails_SMO] 
WHERE StatusId = 2; -- ID 2 is 'Approved' based on sample data

-- C2: Customer Growth Rate (By month proxy via Requests)
SELECT 
    FORMAT(MIN(r.ApplicationDate), 'yyyy-MM') as JoinMonth,
    COUNT(DISTINCT r.CustomerID) as NewCustomers
FROM [SmartBoxData].[LASIMRA_Request_SMO] r
GROUP BY FORMAT(r.ApplicationDate, 'yyyy-MM')
ORDER BY JoinMonth DESC;

-- C3: Customer Sector Distribution
SELECT 
    CASE WHEN IsALTON = 1 THEN 'ALTON' ELSE 'OTHERS' END as Sector,
    COUNT(*) as Count
FROM [SmartBoxData].[LASIMRA_CustomerDetails_SMO]
GROUP BY IsALTON;


-- ==========================================
-- DOMAIN 3: ARREARS
-- ==========================================

-- A1: Gross Arrears (Total Value)
-- REAL-TIME KPI
SELECT SUM(Arrears) as TotalArrears 
FROM [SmartBoxData].[LASIMRA_CustomerDetails_SMO];

-- A2: Arrears Ageing (Grouped by Customer)
SELECT TOP 10
    CustomerName,
    Arrears
FROM [SmartBoxData].[LASIMRA_CustomerDetails_SMO]
WHERE Arrears > 0
ORDER BY Arrears DESC;

-- A3: Arrears Concentration (Top 1% of debtors)
SELECT SUM(Arrears) as TopDebtorsValue
FROM (
    SELECT TOP 1 PERCENT Arrears 
    FROM [SmartBoxData].[LASIMRA_CustomerDetails_SMO] 
    ORDER BY Arrears DESC
) as Sub;


-- ==========================================
-- DOMAIN 4: PAYMENTS
-- ==========================================

-- PM1: Total Revenue (Total Paid)
-- REAL-TIME KPI
SELECT SUM(AmountPaid) as TotalRevenue 
FROM [SmartBoxData].[LASIMRA_Payment_SMO];

-- PM2: Revenue by Channel (PaymentMode)
SELECT 
    PaymentMode,
    SUM(AmountPaid) as Revenue
FROM [SmartBoxData].[LASIMRA_Payment_SMO]
WHERE AmountPaid > 0
GROUP BY PaymentMode;

-- PM3: Payment Success Rate
SELECT 
    CASE WHEN AmountPaid >= AmountRequested THEN 'Full' 
         WHEN AmountPaid > 0 THEN 'Partial' 
         ELSE 'Unpaid' END as PaymentStatus,
    COUNT(*) as Count
FROM [SmartBoxData].[LASIMRA_Payment_SMO]
GROUP BY CASE WHEN AmountPaid >= AmountRequested THEN 'Full' 
              WHEN AmountPaid > 0 THEN 'Partial' 
              ELSE 'Unpaid' END;


-- ==========================================
-- DOMAIN 5: REQUESTS (Approvals)
-- ==========================================

-- R1: Total Requests
SELECT COUNT(*) as TotalRequests 
FROM [SmartBoxData].[LASIMRA_Request_SMO];

-- R2: Request Status Pipeline
SELECT 
    sl.Status,
    COUNT(r.RequestID) as Count
FROM [SmartBoxData].[LASIMRA_Request_SMO] r
LEFT JOIN [SmartBoxData].[LASIMRA_StatusList_SMO] sl ON r.StatusID = sl.ID
GROUP BY sl.Status;

-- R3: Avg Approval Time (Days)
SELECT AVG(DATEDIFF(day, ApplicationDate, ApprovalDate)) as AvgDaysToApproval
FROM [SmartBoxData].[LASIMRA_Request_SMO]
WHERE ApprovalDate IS NOT NULL AND ApplicationDate IS NOT NULL;


-- ==========================================
-- DOMAIN 6: PERMITS
-- ==========================================

-- PM1: Total Permits Issued
SELECT COUNT(*) as TotalPermits 
FROM [SmartBoxData].[LASIMRA_Permits_SMO];

-- PM2: Recently Issued Permits
SELECT TOP 5
    r.RequestTitle,
    p.UploadDate,
    p.CreatedBy
FROM [SmartBoxData].[LASIMRA_Permits_SMO] p
JOIN [SmartBoxData].[LASIMRA_Request_SMO] r ON p.RequestID = r.RequestID
ORDER BY p.UploadDate DESC;


-- ==========================================
-- DOMAIN 7: SURVEILLANCE
-- ==========================================

-- S1: Total Inspections Conducted
SELECT COUNT(*) as TotalInspections 
FROM [SmartBoxData].[LASIMRA_SiteInspection_SMO_1];

-- S2: Inspection Outcome Distribution
SELECT 
    CASE WHEN IsApproved = 1 THEN 'Compliant' ELSE 'Non-Compliant' END as Outcome,
    COUNT(*) as Count
FROM [SmartBoxData].[LASIMRA_SiteInspection_SMO_1]
GROUP BY IsApproved;


-- ==========================================
-- DOMAIN 8: VIOLATIONS
-- ==========================================

-- V1: Total Violations Detected
-- REAL-TIME KPI
SELECT COUNT(*) as TotalViolations 
FROM [SmartBoxData].[LASIMRA_SurvillanceRequest_SMO];

-- V2: Violations by Type
SELECT 
    vt.ViolationName,
    COUNT(sr.ID) as Count
FROM [SmartBoxData].[LASIMRA_SurvillanceRequest_SMO] sr
LEFT JOIN [SmartBoxData].[LASIMRA_ViolationTypes_SMO] vt ON sr.ViolationType = vt.ViolationID
GROUP BY vt.ViolationName;

-- V3: Penalty Revenue Potential
SELECT SUM(CAST(PenaltyFees as DECIMAL(18,2))) as PotentialRevenue
FROM [SmartBoxData].[LASIMRA_SurvillanceRequest_SMO]
WHERE PenaltyFees IS NOT NULL;
