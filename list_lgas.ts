import { executeQuery } from './src/config/db';
import fs from 'fs';

async function listLGAs() {
    try {
        const result = await executeQuery(`
            SELECT LGACode as id, LGAName as name 
            FROM [SmartBoxData].[LASIMRA_LocalGovernment_SMO] 
            ORDER BY LGAName
        `) as any[];
        
        fs.writeFileSync('lga_list.json', JSON.stringify(result, null, 2));
        console.log('Results written to lga_list.json');
    } catch (err: any) {
        console.error(`Error listing LGAs:`, err.message);
    }
}

listLGAs();
