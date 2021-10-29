import getSelector from './getSelector'
import validateUpsert from './validateModifier/validateUpsert'
import cleanModifier from './cleanModifier'
import {Collection, Upsert} from '../../types'

export default <DocumentType>(collection: Collection) => {
  const upsert: Upsert<DocumentType> = async function (selectorArg, modifierArg, options = {}) {
    let modifier = modifierArg as any
    let selector = getSelector(arguments)

    if (collection.model) {
      const schema = collection.model.getSchema()

      if (options.clean !== false) {
        selector = (await cleanModifier(schema, {$set: selector})).$set
        modifier = await cleanModifier(schema, modifier, {isUpsert: true})
      }
      if (options.validate !== false) await validateUpsert(schema, selector, modifier)
    }

    modifier.$setOnInsert = {...modifier.$setOnInsert, _id: collection.generateId()}

    const result = await collection.rawCollection.updateOne(selector, modifier, {upsert: true})

    return result
  }

  return upsert
}
