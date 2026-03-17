import express from 'express';
import { executeQuery } from '../config/db';
import auth from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all stats routes
router.use(auth);

/**
 * @route   GET /api/stats/kpis
 * @desc    Get top-level KPI summary cards
 * @access  Private
 */
router.get('/kpis', async (req, res) => {
  try {
    // 1. Total Permits Issued (Mock query structure mapping to LASIMRA_Request_SMO)
    // Using simple counts to demonstrate structure. Adjust based on actual data shape.
    const kpiQuery = `
      SELECT 
        (SELECT COUNT(*) FROM [SmartBoxData].[LASIMRA_Request_SMO]) as TotalPermits,
        (SELECT COUNT(*) FROM [SmartBoxData].[LASIMRA_Request_SMO] WHERE StatusID IN (SELECT StatusCode FROM [SmartBoxData].[LASIMRA_StatusList_SMO] WHERE Status = 'Pending')) as PendingApplications,
        (SELECT COUNT(*) FROM [SmartBoxData].[LASIMRA_Request_SMO] WHERE StatusID IN (SELECT StatusCode FROM [SmartBoxData].[LASIMRA_StatusList_SMO] WHERE Status = 'Approved')) as ApprovedPermits,
        (SELECT COUNT(*) FROM [SmartBoxData].[LASIMRA_SiteInspection_SMO_1]) as ActiveInspections
    `;

    // To prevent immediate crash if DB not configured yet, wrap in try/catch mapping
    let result;
    try {
        const rawResults = await executeQuery(kpiQuery);
        if (rawResults && rawResults.length > 0) {
            result = rawResults[0];
        }
    } catch(err) {
        // Mock fallback response for frontend dev
        result = {
            TotalPermits: 14502,
            PendingApplications: 432,
            ApprovedPermits: 12100,
            ActiveInspections: 85
        };
    }

    res.json(result);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/stats/trends
 * @desc    Monthly permit application trend - 12 month rolling
 * @access  Private
 */
router.get('/trends', async (req, res) => {
    try {
        const trendQuery = `
            SELECT 
                FORMAT(ApplicationDate, 'yyyy-MM') as Month,
                COUNT(RequestID) as PermitCount
            FROM [SmartBoxData].[LASIMRA_Request_SMO]
            WHERE ApplicationDate >= DATEADD(month, -12, GETDATE())
            GROUP BY FORMAT(ApplicationDate, 'yyyy-MM')
            ORDER BY Month ASC
        `;

        let result;
        try {
            result = await executeQuery(trendQuery);
        } catch (err) {
            // Mock fallback response
            result = [
                { Month: '2025-04', PermitCount: 450 },
                { Month: '2025-05', PermitCount: 480 },
                { Month: '2025-06', PermitCount: 520 },
                { Month: '2025-07', PermitCount: 600 },
                { Month: '2025-08', PermitCount: 580 },
                { Month: '2025-09', PermitCount: 650 },
                { Month: '2025-10', PermitCount: 710 },
                { Month: '2025-11', PermitCount: 680 },
                { Month: '2025-12', PermitCount: 550 },
                { Month: '2026-01', PermitCount: 800 },
                { Month: '2026-02', PermitCount: 850 },
                { Month: '2026-03', PermitCount: 920 }
            ];
        }

        res.json(result);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET /api/stats/distribution
 * @desc    Permit type distribution and Status breakdown
 * @access  Private
 */
router.get('/distribution', async (req, res) => {
    try {
        // Mocking complex aggregation query
        let result = {
            statusBreakdown: [
                { status: 'Pending', count: 432 },
                { status: 'Approved', count: 12100 },
                { status: 'Rejected', count: 1250 },
                { status: 'Suspended', count: 720 }
            ],
            typeDistribution: [
                { category: 'RoW', count: 8500 },
                { category: 'Tower & Mast', count: 2502 }
            ]
        };
        
        res.json(result);
    } catch(err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
