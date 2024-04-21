import { ICSGenerator } from './core/ICSGenerator.js';
import { DDTLoader } from './tsc/DDTLoader.js';

( async () => {

    const results = await new DDTLoader().load();
    console.log( await new ICSGenerator().generate( results ) );

} )();