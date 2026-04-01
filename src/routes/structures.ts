import express from 'express';
import { executeQuery } from '../config/db';
import auth from '../middleware/auth';

const router = express.Router();
router.use(auth);

/**
 * GET /api/structures/stats
 * Returns total counts for RoW and Tower/Mast
 */
router.get('/stats', async (req, res) => {
    try {
        const lgaId = req.query.lgaId as string;
        const period = req.query.period as string || 'all';
        
        // Build base filters (LGA and Period)
        let filterSql = ' WHERE 1=1';
        const params: any = {};
        if (lgaId) {
            filterSql += ' AND r.LocalGovernmentArea_ = @lgaId';
            params.lgaId = lgaId;
        }

        if (period === '24h') {
            filterSql += ' AND r.ApplicationDate >= DATEADD(hour, -24, GETDATE())';
        } else if (period === '7d') {
            filterSql += ' AND r.ApplicationDate >= DATEADD(day, -7, GETDATE())';
        } else if (period === '30d') {
            filterSql += ' AND r.ApplicationDate >= DATEADD(day, -30, GETDATE())';
        } else if (period === 'year') {
            filterSql += ' AND YEAR(r.ApplicationDate) = YEAR(GETDATE())';
        }

        const rowCount = await executeQuery(`
            SELECT COUNT(r.RequestID) as count 
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID
            ${filterSql}
        `, params);

        const tmCount = await executeQuery(`
            SELECT COUNT(r.RequestID) as count 
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
            ${filterSql}
        `, params);

        res.json({
            row: rowCount[0]?.count || 0,
            mast: tmCount[0]?.count || 0
        });
    } catch (err: any) {
        console.error('API ERROR [structures stats]:', err);
        res.status(500).json({ error: 'Failed to fetch structures stats', details: err.message });
    }
});

/**
 * GET /api/structures/trend
 * Returns registration growth over time
 */
router.get('/trend', async (req, res) => {
    try {
        const lgaId = req.query.lgaId as string;
        const period = req.query.period as string || 'all';
        const trendPeriod = req.query.trendPeriod as string || 'month';

        const params: any = {};
        let filterSql = ' WHERE 1=1';
        if (lgaId) {
            filterSql += ' AND r.LocalGovernmentArea_ = @lgaId';
            params.lgaId = lgaId;
        }

        if (period === '24h') {
            filterSql += ' AND r.ApplicationDate >= DATEADD(hour, -24, GETDATE())';
        } else if (period === '7d') {
            filterSql += ' AND r.ApplicationDate >= DATEADD(day, -7, GETDATE())';
        } else if (period === '30d') {
            filterSql += ' AND r.ApplicationDate >= DATEADD(day, -30, GETDATE())';
        } else if (period === 'year') {
            filterSql += ' AND YEAR(r.ApplicationDate) = YEAR(GETDATE())';
        }

        let labelSql = "FORMAT(r.ApplicationDate, 'yyyy-MM')";
        if (trendPeriod === 'day') {
            labelSql = "CAST(r.ApplicationDate AS DATE)";
        } else if (trendPeriod === 'year') {
            labelSql = "CAST(YEAR(r.ApplicationDate) AS VARCHAR)";
        }

        const trend = await executeQuery(`
            SELECT 
                ${labelSql} as label,
                COUNT(r.RequestID) as value
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN (
                SELECT RequestID FROM [SmartBoxData].[LASIMRA_RowRequest_SMO]
                UNION ALL
                SELECT RequestID FROM [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO]
            ) as combined ON r.RequestID = combined.RequestID
            ${filterSql}
            GROUP BY ${labelSql}
            ORDER BY label ASC
        `, params);

        res.json(trend);
    } catch (err: any) {
        console.error('API ERROR [structures trend]:', err);
        res.status(500).json({ error: 'Failed to fetch structures trend', details: err.message });
    }
});

/**
 * GET /api/structures
 * Returns a detailed list of infrastructure structures (Towers, Masts, or RoW)
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const type = req.query.type as string || 'mast'; // Default to mast (Tower/Mast)
    const lgaId = req.query.lgaId as string;
    const period = req.query.period as string || 'all';

    const params: any = { limit };
    let filterSql = ' WHERE 1=1';

    if (lgaId) {
      filterSql += ' AND r.LocalGovernmentArea_ = @lgaId';
      params.lgaId = lgaId;
    }

    if (period === '24h') {
        filterSql += ' AND r.ApplicationDate >= DATEADD(hour, -24, GETDATE())';
    } else if (period === '7d') {
        filterSql += ' AND r.ApplicationDate >= DATEADD(day, -7, GETDATE())';
    } else if (period === '30d') {
        filterSql += ' AND r.ApplicationDate >= DATEADD(day, -30, GETDATE())';
    } else if (period === 'year') {
        filterSql += ' AND YEAR(r.ApplicationDate) = YEAR(GETDATE())';
    }

    let structures;
    let countResult;

    if (type === 'row') {
        structures = await executeQuery(`
            SELECT TOP (@limit)
                r.RequestID as ID,
                r.RequestTitle as SiteID,
                r.ApplicationDate as Date,
                lg.LGAName as LGA,
                COALESCE(pc.ProjectCategoryName, 'RoW Generic') as Category,
                'Right of Way' as Type
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID
            LEFT JOIN [SmartBoxData].[LASIMRA_LocalGovernment_SMO] lg ON r.LocalGovernmentArea_ = lg.ID
            LEFT JOIN [SmartBoxData].[LASIMRA_ROWProcjectCategory_SMO] pc ON rr.ProjectCategory = pc.ID
            ${filterSql}
            ORDER BY r.ApplicationDate DESC
        `, params);

        countResult = await executeQuery(`
            SELECT COUNT(*) as count 
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID
            ${filterSql}
        `, params);
    } else {
        // TOWER / MAST
        structures = await executeQuery(`
            SELECT TOP (@limit)
                r.RequestID as ID,
                r.RequestTitle as SiteID,
                r.ApplicationDate as Date,
                lg.LGAName as LGA,
                COALESCE(ts.StructureTypeName, 'Tower/Mast') as Category,
                'Infrastructure' as Type
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
            LEFT JOIN [SmartBoxData].[LASIMRA_LocalGovernment_SMO] lg ON r.LocalGovernmentArea_ = lg.ID
            LEFT JOIN [SmartBoxData].[LASIMRA_StructureType_SMO] ts ON tm.TypeOfStructure = ts.StructureTypeID
            ${filterSql}
            ORDER BY r.ApplicationDate DESC
        `, params);

        countResult = await executeQuery(`
            SELECT COUNT(*) as count 
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
            ${filterSql}
        `, params);
    }

    res.json({
      data: structures,
      total: countResult[0]?.count || 0,
      limit,
      type
    });
  } catch (err: any) {
    console.error('API ERROR [structures list]:', err);
    res.status(500).json({ error: 'Failed to fetch structures list', details: err.message });
  }
});

export default router;
