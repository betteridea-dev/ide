import {name as graphName,src as graphSrc} from "./graph"
import { name as testName, src as testSrc } from "./test"
import { name as dbAdminname, src as dbAdminSrc } from "./db-admin"

const modules: {
    [foo:string]:string
} = {
    [graphName]: graphSrc,
    [testName]: testSrc,
    [dbAdminname]: dbAdminSrc
}

export default modules