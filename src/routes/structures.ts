import express from 'express';
import { executeQuery } from '../config/db';

const router = express.Router();

/**
 * GET /api/structures
 * Returns a detailed list of infrastructure structures (Towers, Masts)
 */
router.get('/', async (req, res) => {
  try {
    // Basic pagination (default 50)
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const structures = await executeQuery(`
      SELECT TOP ${limit}
        t.ID,
        t.Reference_Number as SiteID,
        t.Site_Address as Address,
        lg.LGAName as LGA,
        t.Longtitude as Longitude,
        t.Latitude as Latitude,
        t.StructureHeight as Height,
        sc.Name as Category,
        st.StructureTypeName as Type
      FROM [SmartBoxData].[LASIMRA_TowerMastDetails_SMO] t
      LEFT JOIN [SmartBoxData].[LASIMRA_LocalGovernment_SMO] lg ON t.Local_Government_Area = lg.ID
      LEFT JOIN [SmartBoxData].[LASIMRA_SiteCategory_SMO] sc ON t.Site_Category = sc.ID
      LEFT JOIN [SmartBoxData].[LASIMRA_StructureType_SMO] st ON t.Type_of_Structure__Tower__Mast_ = st.StructureTypeID
      ORDER BY t.ID DESC
      -- OFFSET ${offset} ROWS -- SQL Server 2012+ syntax
    `);

    const totalCount = await executeQuery(`
      SELECT COUNT(*) as count FROM [SmartBoxData].[LASIMRA_TowerMastDetails_SMO]
    `);

    res.json({
      data: structures,
      total: totalCount[0]?.count || 0,
      limit,
      offset
    });
  } catch (err: any) {
    console.error('API ERROR [structures]:', err);
    res.status(500).json({ error: 'Failed to fetch structures list', details: err.message });
  }
});

export default router;
