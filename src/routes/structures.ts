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
        let lgaId = req.query.lgaId as string;
        if (lgaId === 'all' || lgaId === 'null' || lgaId === 'undefined' || !lgaId) {
            lgaId = '';
        }
        const period = req.query.period as string || 'all';
        const params: any = {};
        let dateFilter = '';

        if (period === '24h') {
            dateFilter = ' AND r.ApplicationDate >= DATEADD(hour, -24, GETDATE())';
        } else if (period === '7d') {
            dateFilter = ' AND r.ApplicationDate >= DATEADD(day, -7, GETDATE())';
        } else if (period === '30d') {
            dateFilter = ' AND r.ApplicationDate >= DATEADD(day, -30, GETDATE())';
        } else if (period === 'year') {
            dateFilter = ' AND YEAR(r.ApplicationDate) = YEAR(GETDATE())';
        }

        if (lgaId) {
            params.lgaId = lgaId;
        }

        const rowCount = await executeQuery(`
            SELECT COUNT(r.RequestID) as count 
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID
            WHERE 1=1 ${dateFilter} ${lgaId ? ' AND rr.LocalGovernmentArea = @lgaId' : ''}
        `, params);

        const tmCount = await executeQuery(`
            SELECT COUNT(r.RequestID) as count 
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON r.RequestID = tm2.RequestID
            WHERE 1=1 ${dateFilter} ${lgaId ? ' AND tm2.LocalGovernmentArea_ = @lgaId' : ''}
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
        let lgaId = req.query.lgaId as string;
        if (lgaId === 'all' || lgaId === 'null' || lgaId === 'undefined' || !lgaId) {
            lgaId = '';
        }
        const period = req.query.period as string || 'all';
        const trendPeriod = req.query.trendPeriod as string || 'month';

        const params: any = {};
        let dateFilter = '';
        
        if (period === '24h') {
            dateFilter = ' AND r.ApplicationDate >= DATEADD(hour, -24, GETDATE())';
        } else if (period === '7d') {
            dateFilter = ' AND r.ApplicationDate >= DATEADD(day, -7, GETDATE())';
        } else if (period === '30d') {
            dateFilter = ' AND r.ApplicationDate >= DATEADD(day, -30, GETDATE())';
        } else if (period === 'year') {
            dateFilter = ' AND YEAR(r.ApplicationDate) = YEAR(GETDATE())';
        }

        if (lgaId) {
            params.lgaId = lgaId;
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
                SELECT RequestID, LocalGovernmentArea FROM [SmartBoxData].[LASIMRA_RowRequest_SMO]
                UNION ALL
                SELECT tm.RequestID, tm2.LocalGovernmentArea_ as LocalGovernmentArea 
                FROM [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm
                INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON tm.RequestID = tm2.RequestID
            ) as combined ON r.RequestID = combined.RequestID
            WHERE 1=1 ${dateFilter} ${lgaId ? ' AND combined.LocalGovernmentArea = @lgaId' : ''}
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
        const period = req.query.period as string || 'all';
        const type = req.query.type as string || 'row';
        let lgaId = req.query.lgaId as string;
        if (lgaId === 'all' || lgaId === 'null' || lgaId === 'undefined' || !lgaId) {
            lgaId = '';
        }

        const params: any = { limit };
        let dateFilter = '';

        if (lgaId) {
            params.lgaId = lgaId;
        }

        if (period === '24h') {
            dateFilter = ' AND r.ApplicationDate >= DATEADD(hour, -24, GETDATE())';
        } else if (period === '7d') {
            dateFilter = ' AND r.ApplicationDate >= DATEADD(day, -7, GETDATE())';
        } else if (period === '30d') {
            dateFilter = ' AND r.ApplicationDate >= DATEADD(day, -30, GETDATE())';
        } else if (period === 'year') {
            dateFilter = ' AND YEAR(r.ApplicationDate) = YEAR(GETDATE())';
        }

        let structures: any[] = [];
        let countResult: any[] = [];

        if (type === 'row') {
            countResult = await executeQuery(`
                SELECT COUNT(r.RequestID) as count 
                FROM [SmartBoxData].[LASIMRA_Request_SMO] r
                INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID
                WHERE 1=1 ${dateFilter} ${lgaId ? ' AND rr.LocalGovernmentArea = @lgaId' : ''}
            `, params);

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
                LEFT JOIN [SmartBoxData].[LASIMRA_LocalGovernment_SMO] lg ON rr.LocalGovernmentArea = lg.ID
                LEFT JOIN [SmartBoxData].[LASIMRA_ROWProcjectCategory_SMO] pc ON rr.ProjectCategory = pc.ID
                WHERE 1=1 ${dateFilter} ${lgaId ? ' AND rr.LocalGovernmentArea = @lgaId' : ''}
                ORDER BY r.ApplicationDate DESC
            `, params);
        } else {
            // TOWER / MAST
            countResult = await executeQuery(`
                SELECT COUNT(r.RequestID) as count 
                FROM [SmartBoxData].[LASIMRA_Request_SMO] r
                INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
                INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON r.RequestID = tm2.RequestID
                WHERE 1=1 ${dateFilter} ${lgaId ? ' AND tm2.LocalGovernmentArea_ = @lgaId' : ''}
            `, params);

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
                INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON r.RequestID = tm2.RequestID
                LEFT JOIN [SmartBoxData].[LASIMRA_LocalGovernment_SMO] lg ON tm2.LocalGovernmentArea_ = lg.ID
                LEFT JOIN [SmartBoxData].[LASIMRA_StructureType_SMO] ts ON tm.TypeOfStructure = ts.StructureTypeID
                WHERE 1=1 ${dateFilter} ${lgaId ? ' AND tm2.LocalGovernmentArea_ = @lgaId' : ''}
                ORDER BY r.ApplicationDate DESC
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
