import express from 'express';
import NodeCache from 'node-cache';
import { executeQuery } from '../config/db';
import { io } from '../server';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

// Helper to get period filter SQL
const getPeriodFilter = (period: string, dateColumn: string) => {
  switch (period) {
    case 'mtd':
      return `AND ${dateColumn} >= DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0)`;
    case 'qtd':
      return `AND ${dateColumn} >= DATEADD(quarter, DATEDIFF(quarter, 0, GETDATE()), 0)`;
    case 'ytd':
      return `AND ${dateColumn} >= DATEADD(year, DATEDIFF(year, 0, GETDATE()), 0)`;
    case '12m':
      return `AND ${dateColumn} >= DATEADD(month, -12, GETDATE())`;
    default:
      return '';
  }
};

/**
 * Domain 1: Structures
 */
router.get('/structures', async (req: any, res: any) => {
  const period = (req.query.period as string) || 'all';
  const cacheKey = `kpi_structures_${period}`;

  const cachedData = cache.get(cacheKey);
  // Temporarily bypass cache to ensure user sees live DB data after mapping changes
  // if (cachedData) return res.json(cachedData);

  try {
    // S1: Total Structures
    const total = await executeQuery(`
      SELECT COUNT(r.RequestID) as value 
      FROM [SmartBoxData].[LASIMRA_Request_SMO] r
      INNER JOIN (
        SELECT RequestID FROM [SmartBoxData].[LASIMRA_RowRequest_SMO]
        UNION ALL
        SELECT RequestID FROM [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO]
      ) as combined ON r.RequestID = combined.RequestID
      ${getPeriodFilter(period, 'r.ApplicationDate') ? 'WHERE 1=1 ' + getPeriodFilter(period, 'r.ApplicationDate') : ''}
    `);

    // S2: Infrastructure Distribution by Project Category & TypeOfStructure
    const distribution = await executeQuery(`
      SELECT 
        COALESCE(st.InfraCategory, 'Unknown') as label,
        COUNT(r.RequestID) as value
      FROM [SmartBoxData].[LASIMRA_Request_SMO] r
      INNER JOIN (
        SELECT rr.RequestID, pc.ProjectCategoryName as InfraCategory 
        FROM [SmartBoxData].[LASIMRA_RowRequest_SMO] rr
        LEFT JOIN [SmartBoxData].[LASIMRA_ROWProcjectCategory_SMO] pc ON rr.ProjectCategory = pc.ID
        
        UNION ALL
        
        SELECT tm.RequestID, ts.StructureTypeName as InfraCategory 
        FROM [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm
        LEFT JOIN [SmartBoxData].[LASIMRA_StructureType_SMO] ts ON tm.TypeOfStructure = ts.StructureTypeID
      ) as st ON r.RequestID = st.RequestID
      ${getPeriodFilter(period, 'r.ApplicationDate') ? 'WHERE 1=1 ' + getPeriodFilter(period, 'r.ApplicationDate') : ''}
      GROUP BY COALESCE(st.InfraCategory, 'Unknown')
    `);

    const trend = await executeQuery(`
      SELECT FORMAT(r.ApplicationDate, 'yyyy-MM') as month, COUNT(*) as value
      FROM [SmartBoxData].[LASIMRA_Request_SMO] r
      WHERE r.ProcessType IN (1, 2)
      ${getPeriodFilter(period, 'r.ApplicationDate')}
      GROUP BY FORMAT(r.ApplicationDate, 'yyyy-MM')
      ORDER BY month ASC
    `);

    const result = {
      total: total[0]?.value || 0,
      distribution,
      trend
    };

    cache.set(cacheKey, result);

    // Real-time emit for S1
    io.emit('kpi_update', { domain: 'structures', metric: 'S1', value: result.total });

    res.json(result);
  } catch (err: any) {
    console.error('KPI ERROR [structures]:', err);
    res.status(500).json({ error: 'Failed to fetch structures KPI', details: err.message, stack: err.stack });
  }
});

/**
 * Domain 2: Customers
 */
router.get('/customers', async (req: any, res: any) => {
  const cacheKey = 'kpi_customers';
  const cachedData = cache.get(cacheKey);
  if (cachedData) return res.json(cachedData);

  try {
    const total = await executeQuery('SELECT COUNT(*) as value FROM [SmartBoxData].[LASIMRA_CustomerDetails_SMO] WHERE StatusId = 2');

    const sector = await executeQuery(`
      SELECT CASE WHEN IsALTON = 1 THEN 'ALTON' ELSE 'OTHERS' END as label, COUNT(*) as value
      FROM [SmartBoxData].[LASIMRA_CustomerDetails_SMO]
      GROUP BY IsALTON
    `);

    const result = {
      total: total[0]?.value || 0,
      sector
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers KPI' });
  }
});

/**
 * Domain 3: Arrears
 */
router.get('/arrears', async (req: any, res: any) => {
  const cacheKey = 'kpi_arrears';
  const cachedData = cache.get(cacheKey);
  if (cachedData) return res.json(cachedData);

  try {
    const total = await executeQuery('SELECT SUM(Arrears) as value FROM [SmartBoxData].[LASIMRA_CustomerDetails_SMO]');

    const ageing = await executeQuery(`
      SELECT TOP 10 CustomerName as label, Arrears as value
      FROM [SmartBoxData].[LASIMRA_CustomerDetails_SMO]
      WHERE Arrears > 0
      ORDER BY Arrears DESC
    `);

    const result = {
      total: total[0]?.value || 0,
      ageing
    };

    cache.set(cacheKey, result);

    // Real-time emit for A1
    io.emit('kpi_update', { domain: 'arrears', metric: 'A1', value: result.total });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch arrears KPI' });
  }
});

/**
 * Domain 4: Payments
 */
router.get('/payments', async (req: any, res: any) => {
  const period = (req.query.period as string) || 'all';
  const cacheKey = `kpi_payments_${period}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) return res.json(cachedData);

  try {
    const total = await executeQuery(`SELECT SUM(AmountPaid) as value FROM [SmartBoxData].[LASIMRA_Payment_SMO] WHERE 1=1 ${getPeriodFilter(period, 'TimeStamp')}`);

    // PM2: Revenue by Channel
    const byChannel = await executeQuery(`
      SELECT PaymentMode as label, COALESCE(SUM(AmountPaid), 0) as value
      FROM [SmartBoxData].[LASIMRA_Payment_SMO]
      WHERE PaymentMode IS NOT NULL AND PaymentMode != ''
      ${getPeriodFilter(period, 'TimeStamp')}
      GROUP BY PaymentMode
      ORDER BY value DESC
    `);

    const result = {
      total: total[0]?.value || 0,
      byChannel
    };

    cache.set(cacheKey, result);

    // Real-time emit for PM1
    io.emit('kpi_update', { domain: 'payments', metric: 'PM1', value: result.total });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments KPI' });
  }
});

/**
 * Domain 5: Requests
 */
router.get('/requests', async (req: any, res: any) => {
  const period = (req.query.period as string) || 'all';
  const cacheKey = `kpi_requests_${period}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) return res.json(cachedData);

  try {
    const total = await executeQuery(`SELECT COUNT(*) as value FROM [SmartBoxData].[LASIMRA_Request_SMO] WHERE 1=1 ${getPeriodFilter(period, 'ApplicationDate')}`);

    const pipeline = await executeQuery(`
      SELECT sl.Status as label, COUNT(r.RequestID) as value
      FROM [SmartBoxData].[LASIMRA_Request_SMO] r
      LEFT JOIN [SmartBoxData].[LASIMRA_StatusList_SMO] sl ON r.StatusID = sl.ID
      WHERE 1=1 ${getPeriodFilter(period, 'r.ApplicationDate')}
      GROUP BY sl.Status
    `);

    const result = {
      total: total[0]?.value || 0,
      pipeline
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests KPI' });
  }
});

/**
 * Domain 6: Permits
 */
router.get('/permits', async (req: any, res: any) => {
  const period = (req.query.period as string) || 'all';
  const cacheKey = `kpi_permits_${period}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) return res.json(cachedData);

  try {
    const total = await executeQuery(`SELECT COUNT(*) as value FROM [SmartBoxData].[LASIMRA_Permits_SMO] WHERE 1=1 ${getPeriodFilter(period, 'UploadDate')}`);

    const recent = await executeQuery(`
      SELECT TOP 5 r.RequestTitle as label, p.UploadDate as date, p.CreatedBy
      FROM [SmartBoxData].[LASIMRA_Permits_SMO] p
      JOIN [SmartBoxData].[LASIMRA_Request_SMO] r ON p.RequestID = r.RequestID
      ORDER BY p.UploadDate DESC
    `);

    const result = {
      total: total[0]?.value || 0,
      recent
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch permits KPI' });
  }
});

/**
 * Domain 7: Surveillance
 */
router.get('/surveillance', async (req: any, res: any) => {
  const cacheKey = 'kpi_surveillance';
  const cachedData = cache.get(cacheKey);
  if (cachedData) return res.json(cachedData);

  try {
    const total = await executeQuery('SELECT COUNT(*) as value FROM [SmartBoxData].[LASIMRA_SiteInspection_SMO_1]');

    // Outcome from associated request status
    const outcomes = await executeQuery(`
      SELECT 
        CASE WHEN r.StatusID = 2 THEN 'Compliant' ELSE 'Non-Compliant/Pending' END as label, 
        COUNT(*) as value
      FROM [SmartBoxData].[LASIMRA_SiteInspection_SMO_1] i
      LEFT JOIN [SmartBoxData].[LASIMRA_Request_SMO] r ON i.RequestID = r.RequestID
      GROUP BY CASE WHEN r.StatusID = 2 THEN 'Compliant' ELSE 'Non-Compliant/Pending' END
    `);

    const result = {
      total: total[0]?.value || 0,
      outcomes
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch surveillance KPI' });
  }
});

/**
 * Domain 8: Violations
 */
router.get('/violations', async (req: any, res: any) => {
  const cacheKey = 'kpi_violations';
  const cachedData = cache.get(cacheKey);
  if (cachedData) return res.json(cachedData);

  try {
    const total = await executeQuery('SELECT COUNT(*) as value FROM [SmartBoxData].[LASIMRA_SurvillanceRequest_SMO]');

    const byType = await executeQuery(`
      SELECT vt.ViolationName as label, COUNT(sr.ID) as value
      FROM [SmartBoxData].[LASIMRA_SurvillanceRequest_SMO] sr
      LEFT JOIN [SmartBoxData].[LASIMRA_ViolationTypes_SMO] vt ON sr.ViolationType = vt.ViolationID
      GROUP BY vt.ViolationName
    `);

    const result = {
      total: total[0]?.value || 0,
      byType
    };

    cache.set(cacheKey, result);

    // Real-time emit for V1
    io.emit('kpi_update', { domain: 'violations', metric: 'V1', value: result.total });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch violations KPI' });
  }
});

export default router;
