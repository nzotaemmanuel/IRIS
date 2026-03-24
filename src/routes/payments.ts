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
    
    // Build parameters for the query
    const params: any = { limit };
    let filterSql = ' WHERE 1=1';

    if (lgaId) {
      filterSql += ' AND tr.LocalGovernmentArea_ = @lgaId';
      params.lgaId = lgaId;
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

    const totalRevenue = await executeQuery(`
      SELECT SUM(p.AmountPaid) as total 
      FROM [SmartBoxData].[LASIMRA_Payment_SMO] p
      LEFT JOIN [SmartBoxData].[LASIMRA_Request_SMO] r ON p.RequestID = r.RequestID
      LEFT JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tr ON p.RequestID = tr.RequestID
      ${filterSql}
    `, params);

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

    const params: any = {};
    let filterSql = ' WHERE AmountPaid > 0';

    if (lgaId) {
      filterSql += ' AND tr.LocalGovernmentArea_ = @lgaId';
      params.lgaId = lgaId;
    }

    if (period === '24h') {
      filterSql += ' AND p.TimeStamp >= DATEADD(hour, -24, GETDATE())';
    } else if (period === '7d') {
      filterSql += ' AND p.TimeStamp >= DATEADD(day, -7, GETDATE())';
    } else if (period === '30d') {
      filterSql += ' AND p.TimeStamp >= DATEADD(day, -30, GETDATE())';
    }

    let labelSql = 'CAST(p.TimeStamp AS DATE)';
    let groupSql = 'CAST(p.TimeStamp AS DATE)';
    
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

    const trend = await executeQuery(`
      SELECT 
        ${labelSql} as label,
        SUM(p.AmountPaid) as value
      FROM [SmartBoxData].[LASIMRA_Payment_SMO] p
      LEFT JOIN [SmartBoxData].[LASIMRA_Request_SMO] r ON p.RequestID = r.RequestID
      LEFT JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tr ON p.RequestID = tr.RequestID
      ${filterSql}
      GROUP BY ${groupSql}
      ORDER BY label ASC
    `, params);

    res.json(trend);
  } catch (err: any) {
    console.error('API ERROR [payments trend]:', err);
    res.status(500).json({ error: 'Failed to fetch payments trend', details: err.message });
  }
});

export default router;
