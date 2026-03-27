import express, { Request, Response } from 'express';
import { executeQuery } from '../config/db';
import auth from '../middleware/auth';

const router = express.Router();
router.use(auth);

/**
 * GET /api/payments
 * Returns detailed transaction history with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  console.log('API REQ [payments]:', req.query);
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const lgaId = req.query.lgaId as string;
    const period = req.query.period as string || 'all';
    const q = req.query.q as string;
    
    // Build parameters for the query
    const params: any = { limit };
    let filterSql = ' WHERE 1=1';

    if (lgaId) {
      filterSql += ' AND tr.LocalGovernmentArea_ = @lgaId';
      params.lgaId = lgaId;
    }

    if (q) {
      filterSql += ` AND (p.paymentRef LIKE '%' + @q + '%' OR c.CustomerName LIKE '%' + @q + '%')`;
      params.q = q;
    }

    if (period === '24h') {
      filterSql += ' AND p.TimeStamp >= DATEADD(hour, -24, GETDATE())';
    } else if (period === '7d') {
      filterSql += ' AND p.TimeStamp >= DATEADD(day, -7, GETDATE())';
    } else if (period === '30d') {
      filterSql += ' AND p.TimeStamp >= DATEADD(day, -30, GETDATE())';
    }

    const payments = await executeQuery(`
      SELECT TOP (@limit)
        p.ID,
        p.RequestID,
        p.AmountPaid as Amount,
        p.PaymentMode as Mode,
        p.TimeStamp as Date,
        p.PaymentStatus as Status,
        p.paymentRef as Reference,
        c.CustomerName as Customer,
        lg.LGAName as LGA
      FROM [SmartBoxData].[LASIMRA_Payment_SMO] p
      LEFT JOIN [SmartBoxData].[LASIMRA_CustomerDetails_SMO] c ON p.CustomerID = c.ID
      LEFT JOIN [SmartBoxData].[LASIMRA_Request_SMO] r ON p.RequestID = r.RequestID
      LEFT JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tr ON p.RequestID = tr.RequestID
      LEFT JOIN [SmartBoxData].[LASIMRA_LocalGovernment_SMO] lg ON tr.LocalGovernmentArea_ = lg.ID
      ${filterSql}
      ORDER BY p.TimeStamp DESC
    `, params);

    // Compute total revenue using payments table only to avoid accidental row duplication
    // and to ensure the total is derived solely from the payments table.
    const totalParams: any = {};
    let totalFilterSql = ' WHERE 1=1';

    if (period === '24h') {
      totalFilterSql += ' AND p.TimeStamp >= DATEADD(hour, -24, GETDATE())';
    } else if (period === '7d') {
      totalFilterSql += ' AND p.TimeStamp >= DATEADD(day, -7, GETDATE())';
    } else if (period === '30d') {
      totalFilterSql += ' AND p.TimeStamp >= DATEADD(day, -30, GETDATE())';
    }

    if (lgaId) {
      // Apply LGA filter without joining tables in the aggregation to avoid duplicate rows.
      totalFilterSql += ` AND EXISTS (
        SELECT 1 FROM [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tr
        WHERE tr.RequestID = p.RequestID AND tr.LocalGovernmentArea_ = @lgaId
      )`;
      totalParams.lgaId = lgaId;
    }

    const totalRevenue = await executeQuery(`
      SELECT SUM(p.AmountPaid) as total
      FROM [SmartBoxData].[LASIMRA_Payment_SMO] p
      ${totalFilterSql}
    `, totalParams);

    res.json({
      data: payments,
      summary: {
          totalRevenue: totalRevenue[0]?.total || 0
      },
      limit
    });
  } catch (err: any) {
    console.error('API ERROR [payments]:', err);
    res.status(500).json({ error: 'Failed to fetch payments list', details: err.message });
  }
});

/**
 * GET /api/payments/trend
 * Returns daily aggregated payment totals
 */
router.get('/trend', async (req: Request, res: Response) => {
  console.log('API REQ [payments trend]:', req.query);
  try {
    const lgaId = req.query.lgaId as string;
    const period = req.query.period as string || 'all';
    const trendPeriod = req.query.trendPeriod as string || 'day';
    const q = req.query.q as string;

    const params: any = {};
    let filterSql = ' WHERE p.AmountPaid > 0';

    if (period === '24h') {
      filterSql += ' AND p.TimeStamp >= DATEADD(hour, -24, GETDATE())';
    } else if (period === '7d') {
      filterSql += ' AND p.TimeStamp >= DATEADD(day, -7, GETDATE())';
    } else if (period === '30d') {
      filterSql += ' AND p.TimeStamp >= DATEADD(day, -30, GETDATE())';
    }

    if (lgaId) {
      // Apply LGA filter using EXISTS so aggregation stays on payments table only
      filterSql += ` AND EXISTS (
        SELECT 1 FROM [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tr
        WHERE tr.RequestID = p.RequestID AND tr.LocalGovernmentArea_ = @lgaId
      )`;
      params.lgaId = lgaId;
    }

    if (q) {
      // Search term: match payment reference or customer name (via EXISTS)
      filterSql += ` AND (
        p.paymentRef LIKE '%' + @q + '%' OR EXISTS (
          SELECT 1 FROM [SmartBoxData].[LASIMRA_CustomerDetails_SMO] c
          WHERE c.ID = p.CustomerID AND c.CustomerName LIKE '%' + @q + '%'
        )
      )`;
      params.q = q;
    }

    let labelSql = 'CAST(p.TimeStamp AS DATE)';
    let groupSql = 'CAST(p.TimeStamp AS DATE)';
    let computedTrendPeriod = trendPeriod;

    if (trendPeriod === 'week') {
      labelSql = "CONCAT(YEAR(p.TimeStamp), '-W', DATEPART(WEEK, p.TimeStamp))";
      groupSql = "CONCAT(YEAR(p.TimeStamp), '-W', DATEPART(WEEK, p.TimeStamp))";
    } else if (trendPeriod === 'month') {
      labelSql = "FORMAT(p.TimeStamp, 'yyyy-MM')";
      groupSql = "FORMAT(p.TimeStamp, 'yyyy-MM')";
    } else if (trendPeriod === 'year') {
      labelSql = "CAST(YEAR(p.TimeStamp) AS VARCHAR)";
      groupSql = "YEAR(p.TimeStamp)";
    }

    // If 'all' period is requested, detect whether the data spans multiple years.
    // If it does, switch to yearly aggregation so the chart shows per-year totals.
    if (period === 'all') {
      const range = await executeQuery(`
        SELECT MIN(YEAR(p.TimeStamp)) as minYear, MAX(YEAR(p.TimeStamp)) as maxYear
        FROM [SmartBoxData].[LASIMRA_Payment_SMO] p
        ${filterSql}
      `, params);

      const minYear = range?.[0]?.minYear;
      const maxYear = range?.[0]?.maxYear;
      if (minYear != null && maxYear != null && minYear < maxYear) {
        // switch to yearly aggregation
        computedTrendPeriod = 'year';
        labelSql = "CAST(YEAR(p.TimeStamp) AS VARCHAR)";
        groupSql = "YEAR(p.TimeStamp)";
      }
    }

    const trend = await executeQuery(`
      SELECT 
        ${labelSql} as label,
        SUM(p.AmountPaid) as value
      FROM [SmartBoxData].[LASIMRA_Payment_SMO] p
      ${filterSql}
      GROUP BY ${groupSql}
      ORDER BY label ASC
    `, params);

    res.json({ data: trend, trendPeriod: computedTrendPeriod });
  } catch (err: any) {
    console.error('API ERROR [payments trend]:', err);
    res.status(500).json({ error: 'Failed to fetch payments trend', details: err.message });
  }
});

export default router;
