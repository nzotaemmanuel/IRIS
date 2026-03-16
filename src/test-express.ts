import express from 'express';
const app = express();
app.get('/', (req: any, res: any) => res.send('ok'));
app.listen(3001, () => console.log('Minimal server on 3001'));
