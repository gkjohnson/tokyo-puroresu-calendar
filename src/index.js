import { ICSGenerator } from './core/ICSGenerator.js';
import { DDTLoader } from './loaders/DDTLoader.js';
import { NoahLoader } from './loaders/NoahLoader.js';

( async () => {

    // use the JST timezone when interpreting dates.
    process.env.TZ = 'Asia/Tokyo';

    const ddtResults = await new DDTLoader().load();
    const tjpwResults = await new DDTLoader( 'https://www.tjpw.jp/schedules', 'TJPW' ).load();
    const noahResults = await new NoahLoader().load();
    
    const results = [ ...ddtResults, ...tjpwResults, ...noahResults ];
    console.log( await new ICSGenerator().generate( results ) );

} )();